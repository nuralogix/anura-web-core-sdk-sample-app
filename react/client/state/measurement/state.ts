import {
  Measurement,
  faceTrackerState,
  type ConstraintFeedback,
  type ConstraintStatus,
  type DFXResults,
  type IsoDate,
  type MediaElementResizeEvent,
  type MeasurementOptions,
  type Settings,
  type FaceTrackerState,
  type ChunkSent,
  type WebSocketError,
  ErrorCategories,
  errorCategories,
  realtimeResultErrors,
  realtimeResultNotes,
  faceAttributeValue,
} from '@nuralogix.ai/anura-web-core-sdk';
import { AnuraMask } from '@nuralogix.ai/anura-web-core-sdk/masks/anura';
import { proxy } from 'valtio';
import { MeasurementState, Profile, MeasurementPhase } from './types';
import { restActionIds } from '../../config/constants';
import loggerState from '../logger/state';
import generalState from '../general/state';
import { logCategory, logMessages } from '../logger/types';
import {
  validateProfile,
  validateMeasurementOptions,
  shouldCancelForLowSNR,
  resetLowSNRCount,
  getPreMeasurementMessageAndConstraints,
  createMessageController,
  buildConstraintOverrides,
  profileValidationMessages,
} from './utils';
import { ErrorCodes} from '../../types';
import configState from '../config/state';
import { ANURA_MASK_SETTINGS, MESSAGE_REQUIRED_FRAMES, NO_FACE_FRAME_THRESHOLD } from './constants';
import { loadSavedProfile, saveProfile } from '../../utils/localStorage';

const { ASSETS_NOT_DOWNLOADED } = faceTrackerState;
const { SEX_ASSIGNED_MALE_AT_BIRTH, SMOKER_FALSE, BLOOD_PRESSURE_MEDICATION_FALSE, DIABETES_NONE } =
  faceAttributeValue;

const downloadFile = (data: Uint8Array, filename: string) => {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Detect iOS devices for coordinate system fix
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

// Swap coordinates on iOS unless in landscape orientation
const shouldSwapCoordinates = () =>
  isIOS() && !(window.screen?.orientation?.type ?? '').startsWith('landscape');

// Get mask settings with iOS coordinate fix
const getMaskSettings = () => {
  return {
    ...ANURA_MASK_SETTINGS,
    ...(shouldSwapCoordinates() && { swapCoordinates: true }),
  };
};

const initMeasurement = async (
  mediaElement: HTMLDivElement,
  assetFolder: string,
  apiUrl: string | undefined
) => {
  const { checkConstraints } = configState.config;
  const settings: Settings = {
    mediaElement,
    assetFolder,
    apiUrl,
    mirrorVideo: true,
    displayMediaStream: true,
    metrics: false,
    logger: {
      extractionLibWasm: false,
      mediaPipe: false,
      beforeRESTCall: false,
      afterRESTCall: false,
      sdk: false,
      extractionWorker: false,
      faceTrackerWorkers: false,
    },
    constraintOverrides: buildConstraintOverrides(checkConstraints),
  };
  const instance = await Measurement.init(settings);
  return instance;
};

const defaultProfile = loadSavedProfile() || {
  age: 0,
  heightCm: 0,
  weightKg: 0,
  sex: SEX_ASSIGNED_MALE_AT_BIRTH,
  smoking: SMOKER_FALSE,
  bloodPressureMedication: BLOOD_PRESSURE_MEDICATION_FALSE,
  diabetes: DIABETES_NONE,
  bypassProfile: true,
};

let mask = new AnuraMask(getMaskSettings());
let measurement: Measurement | null = null;
let bytesDownloaded = 0;
let filesDownloaded: { name: string; bytes: number }[] = [];
let totalSize = 0;
let noFaceFrameCount = 0;

let messageController: ReturnType<typeof createMessageController>;

const RUN_DEFAULTS = {
  measurementPhase: MeasurementPhase.Idle,
  measurementId: '',
  constraintsSatisfiedStable: false,
  constraintCode: null,
} satisfies Pick<MeasurementState, 'measurementPhase' | 'measurementId' | 'constraintsSatisfiedStable' | 'constraintCode'>;

const SESSION_DEFAULTS = {
  ...RUN_DEFAULTS,
  isInitialized: false,
  token: '',
  refreshToken: '',
  studyId: '',
  measurementOptions: {},
  profile: defaultProfile,
  faceTrackerState: ASSETS_NOT_DOWNLOADED,
  isFaceTrackerLoaded: false,
  percentDownloaded: 0,
  finalChunkNumber: 5,
} satisfies Pick<MeasurementState, 'measurementPhase' | 'measurementId' | 'constraintsSatisfiedStable' | 'constraintCode' | 'isInitialized' | 'token' | 'refreshToken' | 'studyId' | 'measurementOptions' | 'profile' | 'faceTrackerState' | 'isFaceTrackerLoaded' | 'percentDownloaded' | 'finalChunkNumber'>;

const measurementState: MeasurementState = proxy({
  assetFolder: '/assets',
  appPath: '.',
  apiUrl: undefined,
  ...SESSION_DEFAULTS,
  results: [],
  setAppSettings: (
    token: string,
    refreshToken: string,
    studyId: string,
    measurementOptions: MeasurementOptions = {}
  ) => {
    measurementState.token = token;
    measurementState.refreshToken = refreshToken;
    measurementState.studyId = studyId;
    loggerState.addLog(logMessages.TOKENS_AND_STUDY_ID_SET, logCategory.app, { token, refreshToken, studyId });
    // Validate measurementOptions before storing
    const validation = validateMeasurementOptions(measurementOptions);
    if (validation.code !== 'VALID') {
      loggerState.addLog(logMessages.MEASUREMENT_OPTIONS_INVALID, logCategory.measurement, {
        validation,
      });
      measurementState.measurementOptions = {};
    } else {
      loggerState.addLog(logMessages.MEASUREMENT_OPTIONS_SET, logCategory.app, { measurementOptions });
      measurementState.measurementOptions = measurementOptions;
    }
    return validation.code === 'VALID';
  },
  init: async (mediaElement: HTMLDivElement) => {
    measurement = await initMeasurement(
      mediaElement,
      `${measurementState.appPath}${measurementState.assetFolder}`,
      measurementState.apiUrl
    );

    measurement.on.bytesDownloaded = (
      bytes: number,
      uncompressedSize: number,
      url: string,
      done: boolean
    ) => {
      const file = filesDownloaded.find((file) => file.name === url);
      if (file) {
        const diff = bytes - file.bytes;
        file.bytes += diff;
        bytesDownloaded += diff;
      } else {
        bytesDownloaded += bytes;
        totalSize += uncompressedSize;
        filesDownloaded.push({ name: url, bytes });
      }
      const TOTAL_SIZE = filesDownloaded.length === 8 ? totalSize : 4337298;

      measurementState.percentDownloaded = Math.min(
        100,
        Math.trunc((bytesDownloaded * 100) / TOTAL_SIZE)
      );
      // console.log("Bytes downloaded", bytes, url, done, bytesDownloaded, measurementState.percentDownloaded);
    };

    measurement.on.error = (category: ErrorCategories, data: unknown | WebSocketError) => {
      if (category === errorCategories.COLLECTOR) {
        loggerState.addLog(logMessages.COLLECTOR_ERROR, logCategory.collector, data);
        if (measurementState.measurementPhase === MeasurementPhase.InProgress) {
          generalState.setErrorCode(ErrorCodes.COLLECTOR);
        }
      }
      if (category === errorCategories.ASSET_DOWNLOAD) {
        // console.log(errors.ERROR_DOWNLOADING_ASSETS, url, error);
      }
      // TODO: handle websocket errors
      if (category === errorCategories.WEB_SOCKET) {
        const payload = data as WebSocketError;
        if (payload.type === 'DISCONNECTED') {
          // The close event is fired when a connection with a WebSocket is closed.
          // A clean disconnection is not an error, but an expected event.
          const { code, reason, wasClean } = payload;
          // Send WEBSOCKET_DISCONNECTED event for any disconnection
          loggerState.addLog(logMessages.WEBSOCKET_DISCONNECTED, logCategory.measurement, { code, reason, wasClean });
          generalState.setErrorCode(ErrorCodes.WEBSOCKET_DISCONNECTED);
          if (!wasClean) {
            // console.error('WebSocket Disconnected unexpectedly:', { code, reason });
          }
        } else if (payload.type === 'ERROR') {
          // The error event is fired when a connection with a WebSocket
          // has been closed due to an error (some data couldn't be sent for example).
          const { event } = payload;
          // console.log('WebSocket Error:', event);
        }
      }
    };

    measurement.on.beforeRESTCall = (timestamp: IsoDate, actionId: number) => {
      switch (actionId) {
        case restActionIds.AUTHS_RENEW:
          // console.log("Before Auths Renew REST Call", timestamp);
          break;
        case restActionIds.RETREIVE_STUDY_CONFIG_DATA:
          // console.log("Before Retrieve Study Config Data REST Call", timestamp);
          break;
        case restActionIds.GET_MEAUREMENT_ID:
          // console.log("Before Get Measurement ID REST Call", timestamp);
          break;
        default:
          break;
      }
    };

    measurement.on.afterRESTCall = (
      timestamp: IsoDate,
      actionId: number,
      status: string,
      error: unknown
    ) => {
      switch (actionId) {
        case restActionIds.AUTHS_RENEW:
          // console.log("After Auths Renew REST Call", timestamp, status, error);
          break;
        case restActionIds.RETREIVE_STUDY_CONFIG_DATA:
          // console.log("After Retrieve Study Config Data REST Call", timestamp, status, error);
          break;
        case restActionIds.GET_MEAUREMENT_ID:
          // console.log("After Get Measurement ID REST Call", timestamp, status, error);
          break;
        default:
          break;
      }
    };

    measurement.on.faceTrackerStateChanged = async (state: FaceTrackerState) => {
      measurementState.setTrackerState(state);
      loggerState.addLog(logMessages.FACE_TRACKER_STATE_CHANGED, logCategory.measurement, { state });
      if (state === faceTrackerState.LOADED) {
        const version = measurementState.getVersion();
        loggerState.addLog(logMessages.FACE_TRACKER_LOADED, logCategory.measurement, { version });
      }
      if (state === faceTrackerState.READY) {
        await measurementState.startTracking();
        mask.setLoadingState(false);
      }
    };

    measurement.on.resultsReceived = async (results: DFXResults) => {
      // Deep copy results to decouple from SDK's internal state management
      const copiedResults = JSON.parse(JSON.stringify(results));
      measurementState.results.push(copiedResults);
      const { Channels, Error, Multiplier, MeasurementDataID } = results;
      const resultsOrder = parseInt(MeasurementDataID.split(':')[1], 10);
      // TODO: handle errors
      const pointList = Object.keys(Channels);
      for (const key of pointList) {
        if (Channels[key]!.Notes) {
          Channels[key]!.Notes.forEach((note) => {
            switch (note) {
              case realtimeResultNotes.NOTE_DEGRADED_ACCURACY:
                break;
              case realtimeResultNotes.NOTE_FT_LIVENSSS_FAILED:
                break;
              case realtimeResultNotes.NOTE_MISSING_MEDICAL_INFO:
                break;
              case realtimeResultNotes.NOTE_MODEL_LIVENSSS_FAILED:
                break;
              case realtimeResultNotes.NOTE_SNR_BELOW_THRESHOLD:
                break;
              case realtimeResultNotes.NOTE_USED_PRED_DEMOG:
                break;
              default:
                // console.log(`Note for point ${key}: ${note}`);
                break;
            }
          });
        }
        if (key === 'SNR') {
          const snrValue = Channels['SNR']!.Data[0] / Multiplier;
          if (shouldCancelForLowSNR(snrValue, resultsOrder)) {
            loggerState.addLog(logMessages.MEASUREMENT_LOW_SNR, logCategory.measurement, {
              snr: snrValue,
              resultsOrder,
            });
            generalState.setErrorCode(ErrorCodes.MEASUREMENT_LOW_SNR);
            break;
          }
        }
      }
      switch (Error.Code) {
        case 'OK':
          break;
        case realtimeResultErrors.WORKER_ERROR:
          loggerState.addLog(logMessages.WORKER_ERROR, logCategory.measurement, {});
          generalState.setErrorCode(ErrorCodes.WORKER_ERROR);
          break;
        case realtimeResultErrors.ANALYSIS_ERROR:
          loggerState.addLog(logMessages.ANALYSIS_ERROR, logCategory.measurement, {});
          generalState.setErrorCode(ErrorCodes.ANALYSIS_ERROR);
          break;
        case realtimeResultErrors.LIVENESS_ERROR:
          loggerState.addLog(logMessages.LIVENESS_ERROR, logCategory.measurement, {});
          // console.log('Liveness Error:', errors.errors);
          break;
        default:
          // console.log('Error:', errors.code, errors.errors);
          break;
      }

      // Intermediate results
      if (resultsOrder < measurementState.finalChunkNumber) {
        const intermediateResults = {
          ...Channels['HR_BPM'] && {
            'HR_BPM' : {
              value: Math.trunc(Channels['HR_BPM'].Data[0] / Multiplier).toString(),
            }
          },
        };
        mask.setIntermediateResults(intermediateResults);
        loggerState.addLog(logMessages.INTERMEDIATE_RESULTS_RECEIVED, logCategory.measurement, {
          results: copiedResults,
        });
      }
      // Final results
      if (resultsOrder === measurementState.finalChunkNumber) {
        measurementState.measurementPhase = MeasurementPhase.Complete;
        // Disconnect WebSocket after receiving final results
        await measurement?.disconnect();
        loggerState.addLog(logMessages.FINAL_RESULTS_RECEIVED, logCategory.measurement, {
          results: copiedResults,
        });
      }
    };
    measurement.on.constraintsUpdated = (
      feedback: ConstraintFeedback,
      status: ConstraintStatus
    ) => {
    };

    measurement.on.chunkSent = (chunk: ChunkSent) => {
      loggerState.addLog(logMessages.CHUNK_SENT, logCategory.measurement, chunk);
      const { chunkNumber, numberChunks } = chunk;
      const isLastChunk = chunkNumber === numberChunks - 1;
      if (isLastChunk && measurementState.measurementPhase === MeasurementPhase.InProgress) {
        measurementState.measurementPhase = MeasurementPhase.Analyzing;
        mask.setLoadingState(true);
        mask.setMaskVisibility(false);
      }
      if (configState.config.downloadPayloads) {
        const { measurementId, payload, metadata } = chunk;
        downloadFile(payload, `${measurementId}-payload-${chunkNumber}.bin`);
        downloadFile(metadata, `${measurementId}-metadata-${chunkNumber}.bin`);
      }
    };

    measurement.on.facialLandmarksUpdated = (drawables) => {
      const isPreMeasurement = drawables.percentCompleted === 0;
      const isMeasuring = measurementState.measurementPhase === MeasurementPhase.InProgress;
      const { checkConstraints } = configState.config;

      if (isMeasuring) {
        if (drawables.face.detected) {
          noFaceFrameCount = 0;
        } else {
          noFaceFrameCount++;
          if (noFaceFrameCount >= NO_FACE_FRAME_THRESHOLD) {
            generalState.setErrorCode(ErrorCodes.FACE_NONE);
            noFaceFrameCount = 0;
          }
        }
      }

      if (isPreMeasurement) {
        const { message, constraints, code } = getPreMeasurementMessageAndConstraints(
          drawables,
          drawables.face.detected,
          checkConstraints,
          mask
        );
        measurementState.constraintCode = code;
        messageController.feed(message);

        if (constraints) {
          mask.draw(drawables, constraints);
        } else {
          mask.draw(drawables);
        }
      } else {
        // During measurement, suppress guidance immediately and just draw
        messageController.clear();
        mask.draw(drawables);
      }
    };

    measurement.on.mediaElementResize = (event: MediaElementResizeEvent) => {
      // | Case # | Orientation | Aspect Ratio Range | Example Devices & Rotated Modes                     |
      // |--------|-------------|--------------------|-----------------------------------------------------|
      // | 1      | Portrait    | `< 0.5`            | Pixel 6, Galaxy S22 Ultra in portrait (20:9 ≈ 0.45) |
      // | 2      | Portrait    | `0.5 – 0.75`       | iPhone SE (16:9 = ~0.56), older Android phones      |
      // | 3      | Portrait    | `> 0.75`           | iPad (4:3 = ~0.75), Surface Go in portrait          |
      // | 4      | Landscape   | `< 1.6`            | iPad in landscape (4:3 = ~1.33), Surface Go         |
      // | 5      | Landscape   | `1.6 – 2.1`        | 1080p monitors (16:9 ≈ 1.78), MacBook (16:10 ≈ 1.6) |
      // | 6      | Landscape   | `> 2.1`            | Pixel 6 landscape (≈2.22), 21:9 ultrawide monitors  |

      const { detail } = event;
      // You can optionally pass partialSettings to adjust the mask
      // settings based on the aspect ratio, orientation or other conditions
      mask.resize(detail, { diameter: 0.8, swapCoordinates: shouldSwapCoordinates() });
      loggerState.addLog(logMessages.MEDIA_ELEMENT_RESIZED, logCategory.measurement, event.detail);
    };
    measurementState.isInitialized = true;
  },

  setTrackerState: (state: FaceTrackerState) => {
    measurementState.faceTrackerState = state;
    const { LOADED, READY } = faceTrackerState;
    measurementState.isFaceTrackerLoaded = state === LOADED || state === READY;
  },
  setApiUrl: (apiUrl: string | undefined) => {
    measurementState.apiUrl = apiUrl;
    if (apiUrl) {
      loggerState.addLog(logMessages.API_URL_SET, logCategory.app, {
        apiUrl,
      });
    } else {
      loggerState.addLog(logMessages.API_URL_NOT_SET, logCategory.app);
    }
  },
  getVersion: () => {
    return measurement!.getVersion();
  },
  disconnect: async () => {
    // Disconnect if not already disconnected
    await measurement?.disconnect();
  },
  reset: async () => {
    if (!measurement) {
      loggerState.addLog(logMessages.SDK_NOT_INITIALIZED, logCategory.measurement);
      return false;
    }
    await measurementState.disconnect();
    measurementState.measurementPhase = MeasurementPhase.Resetting;
    measurementState.constraintsSatisfiedStable = false;
    // Clear stabilization
    messageController.clear();
    noFaceFrameCount = 0;
    const resetSuccess = await measurement.reset();
    if (resetSuccess) {
      loggerState.addLog(logMessages.SDK_RESET_SUCCESS, logCategory.measurement);
      measurementState.resetRun();
    } else {
      loggerState.addLog(logMessages.SDK_RESET_FAILED, logCategory.measurement);
    }
    return resetSuccess;
  },
  prepare: async () => {
    const success = await measurement?.prepare(
      measurementState.token,
      measurementState.refreshToken,
      measurementState.studyId
    );
    if (success) {
      loggerState.addLog(logMessages.MEASUREMENT_PREPARE_SUCCESS, logCategory.measurement);
      const assetsDownloaded = await measurement?.downloadAssets();
      if (assetsDownloaded) {
        loggerState.addLog(logMessages.ASSETS_DOWNLOADED, logCategory.measurement);
      } else {
        loggerState.addLog(logMessages.ASSETS_DOWNLOAD_FAILED, logCategory.measurement);
      }
    } else {
      loggerState.addLog(logMessages.MEASUREMENT_PREPARE_FAILED, logCategory.measurement, {
        hasToken: !!measurementState.token,
        hasRefreshToken: !!measurementState.refreshToken,
        hasStudyId: !!measurementState.studyId,
      });
    }
  },
  resetSession: () => {
    Object.assign(measurementState, SESSION_DEFAULTS);
    bytesDownloaded = 0;
    filesDownloaded = [];
    totalSize = 0;
    noFaceFrameCount = 0;
    measurement = null;
    measurementState.reinitMask();
  },
  resetRun: () => {
    Object.assign(measurementState, RUN_DEFAULTS);
    noFaceFrameCount = 0;
    measurementState.reinitMask();
  },
  setMediaStream: async (mediaStream: MediaStream) => {
    if (measurement) {
      await measurement.setMediaStream(mediaStream);
      const success = measurement.setObjectFit(mask.objectFit);
      if (success) measurement.loadMask(mask.getSvg());
    }
  },
  startTracking: async () => {
    if (measurement) {
      await measurement.setConstraintsConfig(true);
      await measurement.startTracking();
    }
  },
  startMeasurement: async () => {
    if (measurement) {
      measurementState.measurementPhase = MeasurementPhase.InProgress;
      measurementState.results = [];
      noFaceFrameCount = 0;
      resetLowSNRCount();
      const measurementOptions = { ...measurementState.measurementOptions };
      const { bypassProfile, heightCm, weightKg, ...rest } = measurementState.profile;
      const demographics = { height: heightCm, weight: weightKg, ...rest };

      // Set profile only if bypassProfile is false
      if (!bypassProfile) {
        measurement.setDemographics(demographics);
        loggerState.addLog(logMessages.MEASUREMENT_DEMOGRAPHICS_SET, logCategory.measurement, {
          demographics,
        });
      }
      const measurementId = await measurement.startMeasurement(false, measurementOptions);
      measurementState.measurementId = measurementId;
      loggerState.addLog(logMessages.MEASUREMENT_STARTED, logCategory.measurement, {
        measurementId,
        measurementOptions: measurementOptions,
      });
    }
  },
  destroy: async () => {
    if (!measurement) {
      loggerState.addLog(logMessages.SDK_NOT_INITIALIZED, logCategory.measurement);
      return false;
    }
    const destroySuccess = await measurement.destroy();
    if (destroySuccess) {
      loggerState.addLog(logMessages.SDK_DESTROY_SUCCESS, logCategory.measurement);
      measurementState.resetSession();
    } else {
      loggerState.addLog(logMessages.SDK_DESTROY_FAILED, logCategory.measurement);
    }
    return destroySuccess;
  },
  setProfile: (profile: Profile) => {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      loggerState.addLog(logMessages.PROFILE_INVALID, logCategory.measurement, {
        message: profileValidationMessages.INVALID_PROFILE_TYPE,
      });
      return false;
    }

    if (profile.bypassProfile) {
      loggerState.addLog(logMessages.PROFILE_INFO_NOT_SET, logCategory.measurement);
    } else {
      const validation = validateProfile(profile);
      if (!validation.valid) {
        loggerState.addLog(logMessages.PROFILE_INVALID, logCategory.measurement, {
          message: validation.message,
        });
        return false;
      }
      measurementState.profile = profile;
      saveProfile(profile);
      loggerState.addLog(logMessages.PROFILE_SET, logCategory.measurement, {
        profile,
      });
    }
    return true;
  },
  setMaskVisibility: (visibility: boolean) => {
    mask.setMaskVisibility(visibility);
  },
  setMaskLoadingState: (loading: boolean) => {
    mask.setLoadingState(loading);
  },
  reinitMask: () => {
    mask = new AnuraMask(getMaskSettings());
    messageController = createMessageController(mask, MESSAGE_REQUIRED_FRAMES, (stableMsg) => {
      measurementState.constraintsSatisfiedStable = stableMsg === '';
      if (measurementState.constraintCode) {
        loggerState.addLog(logMessages.CONSTRAINT_VIOLATION, logCategory.measurement, { code: measurementState.constraintCode });
      }
    });
    if (measurement) {
      const success = measurement.setObjectFit(mask.objectFit);
      if (success) measurement.loadMask(mask.getSvg());
    }
    mask.setMaskVisibility(false);
  },
});

messageController = createMessageController(mask, MESSAGE_REQUIRED_FRAMES, (stableMsg) => {
  measurementState.constraintsSatisfiedStable = stableMsg === '';
  if (measurementState.constraintCode) {
    loggerState.addLog(logMessages.CONSTRAINT_VIOLATION, logCategory.measurement, { code: measurementState.constraintCode });
  }
});

export default measurementState;
