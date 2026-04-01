import "./styles.css"; // Rollup will process this

import {
  Measurement,
  faceAttributeValue,
  faceTrackerState,
  errorCategories,
  realtimeResultErrors,
  realtimeResultNotes,
  type ConstraintFeedback,
  type ConstraintStatus,
  type Drawables,
  type DFXResults,
  type IsoDate,
  type MediaElementResizeEvent,
  type MeasurementOptions,
  type Settings,
  type FaceTrackerState,
  type Demographics,
  type ChunkSent,
  type ErrorCategories,
  type WebSocketError,  
} from "@nuralogix.ai/anura-web-core-sdk";
import helpers, {
    CameraControllerEvents,
    type CameraStatusChanged,
    type SelectedCameraChanged,
    type MediaDeviceListChanged
} from "@nuralogix.ai/anura-web-core-sdk/helpers";
import { AnuraMask, type AnuraMaskSettings, constraintCodes } from "@nuralogix.ai/anura-web-core-sdk/masks/anura";
import { type DfxPointId, parseResults } from "./helpers";

const { CameraController } = helpers;
const {
    CAMERA_STATUS,
    SELECTED_DEVICE_CHANGED,
    MEDIA_DEVICE_LIST_CHANGED
} = CameraControllerEvents;
let trackerState: FaceTrackerState = faceTrackerState.ASSETS_NOT_DOWNLOADED;

const mediaElement = document.getElementById('measurement') as HTMLDivElement;
const cameraList = document.getElementById('camera-list') as HTMLSelectElement;
const toggleCameraButton = document.getElementById('toggle-camera') as HTMLButtonElement;
const toggleMeasurementButton = document.getElementById('toggle-measurement') as HTMLButtonElement;
const resultsTable = document.getElementById('results-table') as HTMLTableElement;
const measurementContainer = document.querySelector('.measurement-container') as HTMLDivElement;
const loading = document.getElementById('loading') as HTMLDivElement;
if (mediaElement && mediaElement instanceof HTMLDivElement) {
    const settings: Settings = {
        mediaElement,
        assetFolder: '/assets',
        // apiUrl: 'api.deepaffex.ai',
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
        constraintOverrides: {
            minimumFps: 14,
            boxWidth_pct: 100,
            boxHeight_pct: 100,
            checkBackLight: false,
            checkCameraMovement: false,
            checkCentered: true,
            checkDistance: false,
            checkEyebrowMovement: false,
            checkFaceDirection: false,
            checkLighting: false,
            checkMinFps: true,
            checkMovement: false
        }
    };

    const checkIsIOS = () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    /**
     * On iOS Safari the front-camera sensor is rotated 90° relative to
     * portrait display.  In portrait mode the mask must swap X/Y coordinates
     * to compensate.  In landscape (or on non-iOS) no swap is needed.
     */
    const shouldSwapCoordinates = () =>
        checkIsIOS() && !(window.screen?.orientation?.type ?? '').startsWith('landscape');

    // Optional Anura Mask Settings
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
        shouldFlipHorizontally: true,
        swapCoordinates: shouldSwapCoordinates(),
    };
    const mask = new AnuraMask(anuraMaskSettings);
    const measurement = await Measurement.init(settings);
    measurement.setSettings({
        logger: {
            webSocket: false,
        }
    });

    const demographics: Demographics = {
        age: 40,
        height: 180,
        weight: 60,
        sex: faceAttributeValue.SEX_ASSIGNED_MALE_AT_BIRTH,
        smoking: faceAttributeValue.SMOKER_FALSE,
        bloodPressureMedication: faceAttributeValue.BLOOD_PRESSURE_MEDICATION_FALSE,
        diabetes: faceAttributeValue.DIABETES_NONE
    };
    measurement.setDemographics(demographics);

    const camera = CameraController.init();
    let isCameraOpen = false;
    const onSelectedDeviceChanged = async (e: SelectedCameraChanged) => {
        const { deviceId } = e.detail;
        console.log('Selected deviceId', deviceId);
    };

    const onMediaDeviceListChanged = async (e: MediaDeviceListChanged) => {
        const { mediaDevices } = e.detail;
        cameraList.innerHTML = ''; // Clears all options
        const list = mediaDevices.map(mediaDevice => ({
            value: mediaDevice.device.deviceId, text: mediaDevice.device.label
        }));
        list.forEach(optionData => {
            const optionElement = document.createElement('option');
            optionElement.value = optionData.value;
            optionElement.textContent = optionData.text;
            cameraList.appendChild(optionElement);
        });
    };
    
    const onCameraStatus = async (e: CameraStatusChanged) => {
      const { isOpen } = e.detail;
      if (isOpen) {
          const { capabilities } = e.detail;
          console.log({ capabilities });
      }
      isCameraOpen = isOpen;
      if (isCameraOpen && camera.cameraStream) {
          await measurement.setMediaStream(camera.cameraStream);
          const success = measurement.setObjectFit(mask.objectFit);
          if (success) measurement.loadMask(mask.getSvg());
      }
    }

    camera.addEventListener(SELECTED_DEVICE_CHANGED, (onSelectedDeviceChanged as unknown as EventListener));
    camera.addEventListener(MEDIA_DEVICE_LIST_CHANGED, (onMediaDeviceListChanged as unknown as EventListener));
    camera.addEventListener(CAMERA_STATUS, (onCameraStatus as unknown as EventListener));

    const isPermissionGranted = await camera.requestPermission();
    if (isPermissionGranted && cameraList) {
        await camera.list();
        cameraList.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLSelectElement;
            if (target && target.value) camera.setDeviceId(target.value);
        });
    }

    const disableButton = (id: string, disabled: boolean) => {
      const element = document.getElementById(id);
      if (element) {
          if (disabled) {
              element.setAttribute('disabled', 'true');
          } else {
              element.removeAttribute('disabled');
          }
      };
    }

    const destroy = async () => {
        mask.setMaskVisibility(false);
        await measurement.stopTracking();
        await measurement.destroy();
    };

    const toggleCamera = async () => {
        if (isCameraOpen) {
            camera.stop();
            disableButton('toggle-measurement', true);
            disableButton('toggle-camera', false);
            mask.setMaskVisibility(false);
            mask.setLoadingState(true);
            await measurement.reset();
            toggleCameraButton.textContent = 'Open';
        } else {
            resultsTable.classList.add('is-hidden');
            measurementContainer.classList.remove('is-hidden');
            const success = await camera.start(1280, 720);
            toggleCameraButton.textContent = 'Close';
            mask.setMaskVisibility(true);
        }
    }

    if (toggleCameraButton) {
        toggleCameraButton.addEventListener('click', async () => {
            await toggleCamera();
        });
    }

    if (toggleMeasurementButton) {
        toggleMeasurementButton.addEventListener('click', async () => {
            // You can optionally pass measurement options to the startMeasurement method
            // Both userProfileId and partnerId are optional
            // const measurementOptions: MeasurementOptions = {
            //   userProfileId: "userProfileId",
            //   partnerId: "partnerId",
            // };
            disableButton('toggle-measurement', true);
            const measurementId = await measurement.startMeasurement(false);
            console.log("Measurement started with ID:", measurementId);
        });
    }

    let percentDownloaded = 0;
    let bytesDownloaded = 0;
    let totalSize = 0;
    const filesDownloaded: {name: string, bytes: number}[] = [];
    measurement.on.bytesDownloaded = (bytes: number, uncompressedSize: number, url: string, done: boolean) => {
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
      percentDownloaded = Math.min(100, Math.trunc((bytesDownloaded * 100) / TOTAL_SIZE));
      document.getElementById('progress-bar')!.style.width = `${percentDownloaded}%`;
      if (percentDownloaded === 100) {
        document.getElementById('progress-container')!.classList.add('is-hidden');
        document.getElementById('app')!.classList.remove('is-hidden');
      }
    };

    measurement.on.beforeRESTCall = (timestamp: IsoDate, actionId: number) => {
      // console.log("Before REST Call", timestamp, actionId);
    };

    measurement.on.afterRESTCall = (timestamp: IsoDate, actionId: number, status: string, error: unknown) => {
        // console.log("After REST Call", timestamp, actionId, status, error);
    };

    measurement.on.faceTrackerStateChanged = async (state: FaceTrackerState) => {
      trackerState = state;
      if (state === faceTrackerState.LOADED) {
          console.log(measurement.getVersion());
          disableButton('toggle-camera', false);
      }
      if (state === faceTrackerState.READY) {
        disableButton('toggle-measurement', false);
        await measurement.setConstraintsConfig(true);
        await measurement.startTracking();
         mask.setLoadingState(false);
      }
      console.log('faceTrackerStateChanged', state);
    };

    measurement.on.resultsReceived = async (results: DFXResults) => {
        const { Channels, Multiplier, MeasurementDataID } = results;
        const resultsOrder = parseInt(MeasurementDataID.split(':')[1], 10);
        const pointList = Object.keys(Channels) as DfxPointId[];
        const parsedResults = parseResults(results);
        const { points, errors } = parsedResults;

        const finalChunkNumber = 5;
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
                        console.log(`Note for point ${key}: ${note}`);
                        break;
                }
            });
        };

        switch (errors.code) {
            case 'OK':
                break;
            case realtimeResultErrors.WORKER_ERROR:
                console.log('Worker Error:', errors.errors);
                break;
            case realtimeResultErrors.ANALYSIS_ERROR:
                console.log('Analysis Error:', errors.errors);
                break;
            case realtimeResultErrors.LIVENESS_ERROR:
                console.log('Liveness Error:', errors.errors);
                break;
            default:
                console.log('Error:', errors.code, errors.errors);
                break;
        }
        // Intermediate results
        if (resultsOrder < finalChunkNumber) {
            const intermediateResults = {
                ...Channels['HR_BPM'] && {
                    'HR_BPM' : {
                    value: Math.trunc(Channels['HR_BPM'].Data[0] / Multiplier).toString(),
                    }
                },
            };
            mask.setIntermediateResults(intermediateResults);
            for (const key of pointList) {
                console.log(`${resultsOrder} [Intermediate result: ${key}] ${points[key]!.value}`);
            }
        }
        // Final results
        if (resultsOrder === finalChunkNumber) {
            console.log('Final results', parsedResults);

            const BAND_COLOR_MAP: Record<string, string> = {
                YELLOW: 'rgb(255, 236, 137)',
                LIGHT_GREEN: 'rgb(145, 230, 183)',
                GREEN: 'rgb(98, 219, 153)',
                LIGHT_RED: 'rgb(255, 137, 137)',
                RED: 'rgb(255, 87, 87)',
            };

            resultsTable.classList.remove('is-hidden');
            measurementContainer.classList.add('is-hidden');
            const tbody = resultsTable.querySelector('tbody')!;
            tbody.innerHTML = '';

            const uniqueGroups = Array.from(
                new Set(pointList.map(p => points[p]!.meta.group))
            );

            uniqueGroups.forEach(pointGroup => {
                pointList.forEach(key => {
                    const point = points[key]!;
                    const { meta, info, dial } = point;
                    const { sections } = dial;
                    const { group, resultsType } = meta;
                    if (resultsType === 'INTERNAL') return;
                    if (group !== pointGroup) return;
                    const { name, unit } = info;
                    const color = sections.length === 0
                        ? 'transparent'
                        : BAND_COLOR_MAP[sections[dial.group - 1]?.bandColor] ?? 'transparent';

                    let value: string | number[] = point.value;
                    let displayName = name;

                    // Handle CVD_MULTI_YEAR_RISK_PROBS: extract the probability for a specific year
                    const targetYear = 10;
                    if (key === 'CVD_MULTI_YEAR_RISK_PROBS' && points['CVD_MULTI_YEAR_RISK_YEARS']) {
                        const years = points['CVD_MULTI_YEAR_RISK_YEARS']!.value as number[];
                        const index = years.indexOf(targetYear);
                        value = index !== -1 ? (Number((value as number[])[index]).toFixed(2) ?? 'N/A') : 'N/A';
                        displayName = `${name} (${targetYear}-year risk)`;
                    }

                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td');
                    nameCell.textContent = displayName;
                    const unitCell = document.createElement('td');
                    unitCell.textContent = unit;
                    const valueCell = document.createElement('td');
                    valueCell.textContent = String(value);
                    valueCell.style.backgroundColor = color;
                    const groupCell = document.createElement('td');
                    groupCell.textContent = group;
                    row.appendChild(nameCell);
                    row.appendChild(unitCell);
                    row.appendChild(valueCell);
                    row.appendChild(groupCell);
                    tbody.appendChild(row);

                    console.log(`${key} - value: ${point.value}, dial:`, point.dial);
                });
            });

            loading.classList.add('is-hidden');
            await measurement.disconnect();
            await toggleCamera();
        }
    };

    measurement.on.constraintsUpdated = (feedback: ConstraintFeedback, status: ConstraintStatus) => {
        // if (feedback === constraintFeedback.FACE_FAR && status === constraintStatus.ERROR) {
        //     console.log('Too far from camera, move closer to the camera.');
        // }
    };

    measurement.on.chunkSent = (chunk: ChunkSent) => {
        const { chunkNumber, numberChunks } = chunk;
        // saveToDisk(chunk);
        if (chunkNumber === numberChunks - 1) {
            loading.classList.remove('is-hidden');
        }
    };

    measurement.on.error = (category: ErrorCategories, data: unknown | WebSocketError) => {
        if (category === errorCategories.COLLECTOR) {
            console.log('Collector Error:', data);
        }
        if (category === errorCategories.ASSET_DOWNLOAD) {
            console.log('Download Error:', data);
        }
        if (category === errorCategories.WEB_SOCKET) {
            const payload = data as WebSocketError;
            if (payload.type === 'DISCONNECTED') {
                const { code, reason, wasClean } = payload;
                if (!wasClean) {
                    console.error('WebSocket Disconnected unexpectedly:', { code, reason });
                }
            } else if (payload.type === 'ERROR') {
                const { event } = payload;
                console.log('WebSocket Error:', event);
            }
        }
    };

    const downloadFile = (data: ArrayBuffer, filename: string) => {
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const saveToDisk = (chunk: ChunkSent) => {
        const { chunkNumber, payload, metadata, measurementId } = chunk;
        downloadFile(payload.buffer as ArrayBuffer, `${measurementId}-payload-${chunkNumber}.bin`);
        downloadFile(metadata.buffer as ArrayBuffer, `${measurementId}-metadata-${chunkNumber}.bin`);
    };

    measurement.on.facialLandmarksUpdated = (drawables: Drawables) => {
          mask.setText('');
          const { DISTANCE, DIRECTION, ROLL, CENTER, MOVEMENT } = constraintCodes;
          if (drawables.percentCompleted === 0) {
            const constraints = mask.checkConstraints(drawables.face, drawables.annotations);
            const {
                distanceConstraint,
                directionConstraint,
                rollConstraint,
                centerConstraint,
                movementConstraint
            } = constraints;
            let message = '';
            if (distanceConstraint !== DISTANCE.OK) {
                message = distanceConstraint === DISTANCE.TOO_CLOSE
                    ? 'Move Back'
                    : 'Move Closer';
            } else if (directionConstraint !== DIRECTION.OK) {
              if (directionConstraint === DIRECTION.TURN_LEFT) {
                message = 'Turn Left';
              } else if (directionConstraint === DIRECTION.TURN_RIGHT) {
                message = 'Turn Right';
              } else if (directionConstraint === DIRECTION.TURN_UP) {
                message = 'Look Up';
              } else if (directionConstraint === DIRECTION.TURN_DOWN) {
                message = 'Look Down';
              }
            } else if (rollConstraint !== ROLL.OK) {
                message = rollConstraint === ROLL.TILT_LEFT
                    ? 'Tilt your face left'
                    : 'Tilt your face right';
            } else if (centerConstraint === CENTER.NOT_CENTERED) {
              message = 'Center your face';
            } else if (movementConstraint === MOVEMENT.TOO_MUCH_MOVEMENT) {
              message = 'Hold Still';
            }
            mask.setText(message);
            mask.draw(drawables, constraints);
          } else {
            mask.draw(drawables);
          }
          if (drawables.percentCompleted >= 100) {
            mask.setLoadingState(true);
          }
          if (!drawables.face.detected) {
            mask.setText('Face Not Detected', 'DEFAULT');
          }
    };

    measurement.on.mediaElementResize = (event: MediaElementResizeEvent) => {
        const { detail } = event;
        const { isPortrait, aspectRatio } = detail;
        const partialSettings = {
            diameter: 0.8,
            swapCoordinates: shouldSwapCoordinates(),
        };
        if (isPortrait && aspectRatio < 0.5) {
            partialSettings.diameter = 0.81;
        }
        mask.resize(detail, partialSettings);
    };
    
    const apiUrl = 'http://localhost:7000/api';

    const studyId = await fetch(`${apiUrl}/studyId`);
    const studyIdResponse = await studyId.json();

    const token = await fetch(`${apiUrl}/token`);
    const tokenResponse = await token.json();

    if (studyIdResponse.status === '200' && tokenResponse.status === '200') {
        const success = await measurement.prepare(
            tokenResponse.token,
            tokenResponse.refreshToken,
            studyIdResponse.studyId
        );
        if (success) await measurement.downloadAssets();
    } else {
        console.error('Failed to get Study ID and Token pair');
    }
}
