import {
  Measurement,
  faceTrackerState,
  type ConstraintFeedback,
  type ConstraintStatus,
  type Drawables,
  type Results,
  type IsoDate,
  type MediaElementResizeEvent,
  type MeasurementOptions,
  type Settings,
  type FaceTrackerState,
  type Demographics,
  type ChunkSent,
  type DfxPointId,
  type WebSocketError,
  ErrorCategories,
  errorCategories,
  constraintFeedback,
  constraintStatus,
  realtimeResultErrors,
  realtimeResultNotes,
} from '@nuralogix.ai/anura-web-core-sdk';
import { AnuraMask, type AnuraMaskSettings } from '@nuralogix.ai/anura-web-core-sdk/masks/anura';
import { proxy } from 'valtio';
import { MeasurementState } from './types';
import { errors, restActionIds } from '../../config/constants';
import notificationState from '../notification/state';
import { NotificationTypes } from '../notification/types';
import i18next from 'i18next';
import loggerState from '../logger/state';
import { logCategory, logMessages } from '../logger/types';
import { shouldCancelForLowSNR } from './utils';

const { ASSETS_NOT_DOWNLOADED } = faceTrackerState;

const initMeasurement = async (
  mediaElement: HTMLDivElement,
  assetFolder: string,
  apiUrl: string
) => {
  const settings: Settings = {
    mediaElement,
    assetFolder,
    apiUrl,
    mirrorVideo: true,
    displayMediaStream: true,
    metrics: true,
    logger: {
      extractionLibWasm: false,
      mediaPipe: false,
      beforeRESTCall: false,
      afterRESTCall: false,
      sdk: false,
      extractionWorker: false,
      faceTrackerWorkers: false,
    },
    constraintOverrides: {
      minimumFps: 14,
      boxWidth_pct: 100,
      boxHeight_pct: 100,
      checkBackLight: false,
      checkCameraMovement: false,
      checkCentered: true,
      checkDistance: true,
      checkEyebrowMovement: false,
      checkFaceDirection: true,
      checkLighting: false,
      checkMinFps: true,
      checkMovement: true,
    },
  };
  const instance = await Measurement.init(settings);
  return instance;
};
const anuraMaskSettings: AnuraMaskSettings = {
  starFillColor: '#39cb3a',
  starBorderColor: '#d1d1d1',
  pulseRateColor: 'red',
  pulseRateLabelColor: '#ffffff',
  backgroundColor: '#ffffff',
  countDownLabelColor: '#000000',
  faceNotCenteredColor: '#fc6a0f',
  /** must be > 0 and <= 1 */
  diameter: 0.8,
  /** must be > 0 and <= 1 */
  topMargin: 0.06,
  /** must be > 0 and <= 1 */
  bottomMargin: 0.02,
};
const mask = new AnuraMask(anuraMaskSettings);
let measurement: Measurement | null = null;
let bytesDownloaded = 0;
let filesDownloaded: { name: string; bytes: number }[] = [];
let totalSize = 0;

const measurementState: MeasurementState = proxy({
  assetFolder: '/assets',
  apiUrl: 'api.deepaffex.ai', // TODO add EnvVars prodivers like in wms1.0
  faceTrackerState: ASSETS_NOT_DOWNLOADED,
  percentDownloaded: 0,
  warningMessage: '',
  isMeasurementInProgress: false,
  isMeasurementComplete: false,
  isAnalyzingResults: false,
  results: [],
  init: async (mediaElement: HTMLDivElement) => {
    measurement = await initMeasurement(
      mediaElement,
      measurementState.assetFolder,
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
      const TOTAL_SIZE = filesDownloaded.length === 7 ? totalSize : 9_000_000;

      measurementState.percentDownloaded = Math.min(
        100,
        Math.trunc((bytesDownloaded * 100) / TOTAL_SIZE)
      );
      // console.log("Bytes downloaded", bytes, url, done, bytesDownloaded, measurementState.percentDownloaded);
    };

    measurement.on.error = (category: ErrorCategories, data: unknown | WebSocketError) => {
      if (category === errorCategories.COLLECTOR) {
        loggerState.addLog(logMessages.COLLECTOR_ERROR, logCategory.collector, data);
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
    };

    measurement.on.resultsReceived = (results: Results) => {
      measurementState.results.push(results);
      const { points, resultsOrder, finalChunkNumber, errors } = results;
      // TODO: handle errors
      const pointList = Object.keys(points) as DfxPointId[];
      for (const key of pointList) {
        const { notes } = points[key]!;
        notes.forEach(note => {
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
      switch (errors.code) {
        case 'OK':
          break;
        case realtimeResultErrors.WORKER_ERROR:
          // console.log('Worker Error:', errors.errors);
          break;
        case realtimeResultErrors.ANALYSIS_ERROR:
          // console.log('Analysis Error:', errors.errors);
          break;
        case realtimeResultErrors.LIVENESS_ERROR:
          // console.log('Liveness Error:', errors.errors);
          break;
        default:
          // console.log('Error:', errors.code, errors.errors);
          break;
      }

      if (shouldCancelForLowSNR(results)) {
        measurementState.stopMeasurement();
        notificationState.showNotification(NotificationTypes.Error, i18next.t('ERR_MSG_SNR'));
        return;
      }

      // Intermediate results
      if (resultsOrder < finalChunkNumber) {
        mask.setIntermediateResults(points);
      }
      // Final results
      if (resultsOrder === finalChunkNumber) {
        measurementState.isAnalyzingResults = false;
        measurementState.isMeasurementComplete = true;
      }
    };

    measurement.on.constraintsUpdated = (
      feedback: ConstraintFeedback,
      status: ConstraintStatus
    ) => {
      // console.log('Feedback: ', feedback, ' status: ', status);
      if (status === constraintStatus.GOOD) {
        measurementState.warningMessage = '';
      }
      let notifType = NotificationTypes.Info;
      if (status === constraintStatus.ERROR) {
        notifType = NotificationTypes.Error;
      }
      if (status === constraintStatus.WARN) {
        notifType = NotificationTypes.Warning;
      }
      if (feedback === constraintFeedback.FACE_NONE) {
        notificationState.showNotification(notifType, i18next.t('ERR_FACE_NONE'));
      }
      // TODO handle any other msgs needed
      if (feedback === constraintFeedback.FACE_FAR) {
        measurementState.warningMessage = i18next.t('WARNING_CONSTRAINT_DISTANCE');
      }
      if (feedback === constraintFeedback.FACE_DIRECTION) {
        measurementState.warningMessage = i18next.t('WARNING_CONSTRAINT_GAZE');
      }
      // console.log("Constraints Updated", feedback, status);
    };

    measurement.on.chunkSent = (chunk: ChunkSent) => {
      loggerState.addLog(logMessages.CHUNK_SENT, logCategory.measurement, chunk);
    };

    measurement.on.facialLandmarksUpdated = (drawables: Drawables) => {
      if (drawables.face.detected) {
        mask.draw(drawables);
        if (drawables.percentCompleted > 0 && !measurementState.isMeasurementInProgress) {
          measurementState.isMeasurementInProgress = true;
        }
        if (drawables.percentCompleted >= 100) {
          mask.setMaskVisibility(false);
          // cameraState.stop();
          measurementState.isMeasurementInProgress = false;
          measurementState.isAnalyzingResults = true;
        }
      } else {
        loggerState.addLog(logMessages.FACE_NOT_DETECTED, logCategory.measurement);
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
      // const { isPortrait, aspectRatio } = detail;
      // const partialSettings: Partial<AnuraMaskSettings> = {
      //   diameter: 0.8,
      // };
      // You can optionally pass partialSettings to adjust the mask
      // settings based on the aspect ratio, orientation or other conditions
      // if (isPortrait && aspectRatio < 0.5) {
      //     partialSettings.diameter = 0.81;
      // }
      // mask.resize(detail, partialSettings);
      mask.resize(detail);
      loggerState.addLog(logMessages.MEDIA_ELEMENT_RESIZED, logCategory.measurement, event);
    };
  },

  stopMeasurement: async () => {
    // TODO fix logic
    await measurement?.destroy();
    measurementState.isMeasurementInProgress = false;
  },

  setTrackerState: (state: FaceTrackerState) => {
    measurementState.faceTrackerState = state;
  },
  setApiUrl: (apiUrl: string) => {
    measurementState.apiUrl = apiUrl;
  },
  getVersion: () => {
    return measurement?.getVersion();
  },
  prepare: async () => {
    const apiUrl = '/api';

    const studyId = await fetch(`${apiUrl}/studyId`);
    const studyIdResponse = await studyId.json();

    const token = await fetch(`${apiUrl}/token`);
    const tokenResponse = await token.json();

    if (studyIdResponse.status === '200' && tokenResponse.status === '200' && measurement) {
      await measurement.prepare(
        tokenResponse.token,
        tokenResponse.refreshToken,
        studyIdResponse.studyId
      );
      await measurement.downloadAssets();
    } else {
      console.error('Failed to get Study ID and Token pair');
    }
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
      await measurement.startTracking();
    }
  },
  stopTracking: async () => {
    if (measurement) {
      await measurement.stopTracking();
    }
  },
  startMeasurement: async (measurementOptions?: MeasurementOptions) => {
    if (measurement) {
      measurementState.results = [];
      await measurement.startMeasurement();
    }
  },
  setDemographics: (demographics: Demographics) => {
    if (measurement) {
      measurement.setDemographics(demographics);
    }
  },
  setMaskVisibility: (visibility: boolean) => {
    mask.setMaskVisibility(visibility);
  },
});

export default measurementState;
