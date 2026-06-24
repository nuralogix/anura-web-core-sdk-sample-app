import { proxy, ref } from 'valtio';
import type { CameraState, MediaDevice } from './types';
import { CameraEnumerationPhase } from './types';
import helpers, {
  CameraControllerEvents,
  type CameraStatusChanged,
  MediaDeviceListChanged,
  SelectedCameraChanged,
} from '@nuralogix.ai/anura-web-core-sdk/helpers';
import configState from '../config/state';
import generalState from '../general/state';
import { ErrorCodes } from '../../types';
import loggerState from '../logger/state';
import { logCategory, logMessages } from '../logger/types';

const { CameraController } = helpers;
const { CAMERA_STATUS, SELECTED_DEVICE_CHANGED, MEDIA_DEVICE_LIST_CHANGED } =
  CameraControllerEvents;

const cameraState: CameraState = proxy({
  deviceId: '',
  isPermissionGranted: false,
  enumerationPhase: CameraEnumerationPhase.Idle,
  isOpen: false,
  capabilities: null,
  mediaDevices: [],
  cameraStream: null,
  trackinfo: {
    cameraWidth: 0,
    cameraHeight: 0,
    cameraFrameRate: 0,
  },
  start: async (frameWidth: number, frameHeight: number) => {
    const { cameraFacingMode } = configState.config;

    const success = await camera.start(frameWidth, frameHeight, cameraFacingMode);
    if (success) {
      loggerState.addLog(logMessages.CAMERA_STARTED, logCategory.camera);
    } else {
      loggerState.addLog(logMessages.CAMERA_START_FAILED, logCategory.camera);
      generalState.setErrorCode(ErrorCodes.CAMERA_START_FAILED);
      return success;
    }
    const { cameraWidth, cameraHeight, cameraFrameRate } = camera;
    cameraState.trackinfo = {
      cameraWidth,
      cameraHeight,
      cameraFrameRate,
    };
    return success;
  },
  stop: () => {
    if (cameraState.isOpen) {
      camera.stop();
    }
    // TODO Fix select component UI lib, WUL-134, then uncomment below line
    // cameraState.deviceId = '';
    cameraState.trackinfo = { cameraWidth: 0, cameraHeight: 0, cameraFrameRate: 0 };
  },
  requestPermission: async () => {
    const permissionResult = await camera.requestPermission();
    cameraState.isPermissionGranted = permissionResult.success;

    if (cameraState.isPermissionGranted) {
      loggerState.addLog(logMessages.CAMERA_PERMISSION_GRANTED, logCategory.camera, {});
    } else {
      loggerState.addLog(logMessages.CAMERA_PERMISSION_DENIED, logCategory.camera, {});
      generalState.setErrorCode(ErrorCodes.CAMERA_PERMISSION_DENIED);
    }
  },
  listCameras: async () => {
    cameraState.enumerationPhase = CameraEnumerationPhase.Enumerating;
    await camera.list();
    const mediaDevices: MediaDevice[] = camera.mediaDevices.map((mediaDevice) => ({
      device: { ...mediaDevice.device },
      capabilities: { ...mediaDevice.capabilities },
    }));
    cameraState.mediaDevices = [...mediaDevices];

    const { defaultCameraId, cameraFacingMode } = configState.config;

    // cameraFacingMode takes precedence over defaultCameraId
    if (cameraFacingMode && defaultCameraId) {
      loggerState.addLog(logMessages.CAMERA_DEFAULT_ID_IGNORED, logCategory.camera, {
        cameraFacingMode,
        defaultCameraId,
      });
    } else {
      if (defaultCameraId) {
        const match = mediaDevices.find((d) => d.device.deviceId === defaultCameraId);
        if (match) {
          camera.setDeviceId(defaultCameraId);
          loggerState.addLog(logMessages.CAMERA_AUTO_SELECTED_DEFAULT_ID, logCategory.camera, {
            deviceId: match.device.deviceId,
            label: match.device.label,
          });
        } else {
          loggerState.addLog(logMessages.CAMERA_DEFAULT_ID_NOT_FOUND, logCategory.camera, {
            defaultCameraId,
          });
        }
      }
    }

    cameraState.enumerationPhase = CameraEnumerationPhase.Done;
  },
  updateDeviceId: (deviceId: string) => {
    camera.setDeviceId(deviceId);
  },
});

const camera = CameraController.init();

const onSelectedDeviceChanged = async (e: SelectedCameraChanged) => {
  const { deviceId } = e.detail;
  cameraState.deviceId = deviceId;
};

const onCameraStatus = async (e: CameraStatusChanged) => {
  const { isOpen } = e.detail;
  if (isOpen) {
    const { capabilities } = e.detail;
    cameraState.capabilities = capabilities;
    cameraState.cameraStream = camera.cameraStream ? ref(camera.cameraStream) : null;
  } else {
    cameraState.capabilities = null;
    cameraState.cameraStream = null;
  }
  cameraState.isOpen = isOpen;
};

const onMediaDeviceListChanged = async (e: MediaDeviceListChanged) => {
  const { mediaDevices } = e.detail;
  cameraState.mediaDevices = mediaDevices;
  cameraState.enumerationPhase = CameraEnumerationPhase.Done;
};

camera.addEventListener(
  SELECTED_DEVICE_CHANGED,
  onSelectedDeviceChanged as unknown as EventListener
);

camera.addEventListener(
  MEDIA_DEVICE_LIST_CHANGED,
  onMediaDeviceListChanged as unknown as EventListener
);

camera.addEventListener(CAMERA_STATUS, onCameraStatus as unknown as EventListener);

export default cameraState;
