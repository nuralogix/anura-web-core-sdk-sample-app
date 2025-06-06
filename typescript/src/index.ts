import "./styles.css"; // Rollup will process this

import {
  Measurement,
  faceAttributeValue,
  faceTrackerState,
  errorCategories,
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
  type ErrorCategories,
} from "@nuralogix.ai/anura-web-core-sdk";
import helpers, {
    CameraControllerEvents,
    type CameraStatusChanged,
    type SelectedCameraChanged,
    type MediaDeviceListChanged
} from "@nuralogix.ai/anura-web-core-sdk/helpers";
import { AnuraMask, type AnuraMaskSettings } from "@nuralogix.ai/anura-web-core-sdk/masks/anura";

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
if (mediaElement && mediaElement instanceof HTMLDivElement) {
    const settings: Settings = {
        mediaElement,
        assetFolder: 'https://unpkg.com/@nuralogix.ai/anura-web-core-sdk/lib/assets',
        apiUrl: 'api.deepaffex.ai',
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
        diameter: 0.44,
        /** must be > 0 and <= 1 */
        sideHeight: 0.06,
        /** Relative to the top of the container */
        maskTopMargin: 10,
        /** Relative to the bottom of the mask */
        heartTopMargin: 30,
        /** Relative to the bottom of the heart */
        starsTopMargin: 20,
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
        diabetes: faceAttributeValue.DIABETES_NONE,
        unit: 'Metric'
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

    const toggleCamera = async () => {
        if (isCameraOpen) {
            camera.stop();
            disableButton('toggle-measurement', true);
            disableButton('toggle-camera', false);
            await measurement.stopTracking();
            mask.setMaskVisibility(false);
        } else {
            const success = await camera.start(1280, 720);
        }
    }

    if (toggleCameraButton) {
        toggleCameraButton.addEventListener('click', async () => {
            toggleCameraButton.textContent === 'Open'
            ? toggleCameraButton.textContent = 'Close'
            : toggleCameraButton.textContent = 'Open';
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
            await measurement.startMeasurement();
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

    measurement.on.downloadError = (url: string, error: unknown) => {
        // console.log("Download error", url, error);
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
        await measurement.startTracking();
      }
      console.log('faceTrackerStateChanged', state);
    };

    measurement.on.resultsReceived = (results: Results) => {
        const { points, resultsOrder, finalChunkNumber } = results;
        const pointList = Object.keys(points);
        // Intermediate results
        if (resultsOrder < finalChunkNumber) {
            mask.setIntermediateResults(points);
            pointList.forEach(point => {
                console.log(`${resultsOrder} [Intermediate result: ${point}] ${points[point].value}`);
            });
        }
        // Final results
        if (resultsOrder === finalChunkNumber) {
            console.log('Final results', results);
            pointList.forEach(point => {
                console.log(`${point} - value: ${points[point].value}, dial:`, points[point].dial);
            });
        }
    }

    measurement.on.constraintsUpdated = (feedback: ConstraintFeedback, status: ConstraintStatus) => {
      // console.log("Constraints Updated", feedback, status);
    };

    measurement.on.chunkSent = (chunk: ChunkSent) => {
        // console.log('Chunk Sent', chunk);
    };

    measurement.on.error = (category: ErrorCategories, data: unknown) => {
        if (category === errorCategories.COLLECTOR) {
            console.log('Collector Error:', data);
        }
    };

    measurement.on.facialLandmarksUpdated = (drawables: Drawables) => {
        if(drawables.face.detected) {
            mask.draw(drawables);
        } else {
            console.log('No face detected');
        }
    }

    measurement.on.mediaElementResize = (event: MediaElementResizeEvent) => {
        mask.resize(event.detail);
        console.log('mediaElementResize', event);
    }
    
    const apiUrl = 'http://localhost:7000/api';

    const studyId = await fetch(`${apiUrl}/studyId`);
    const studyIdResponse = await studyId.json();

    const token = await fetch(`${apiUrl}/token`);
    const tokenResponse = await token.json();

    if (studyIdResponse.status === '200' && tokenResponse.status === '200') {
        await measurement.prepare(
            tokenResponse.token,
            tokenResponse.refreshToken,
            studyIdResponse.studyId
        );
        await measurement.downloadAssets();
    } else {
        console.error('Failed to get Study ID and Token pair');
    }
}
