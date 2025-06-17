import { proxy, ref } from 'valtio';
import type { CameraState, MediaDevice } from './types';
import helpers, {
  CameraControllerEvents,
  type CameraStatusChanged,
  MediaDeviceListChanged,
  SelectedCameraChanged,
} from '@nuralogix.ai/anura-web-core-sdk/helpers';
import notificationState from '../notification/state';
import { NotificationTypes } from '../notification/types';
import i18next from 'i18next';

const { CameraController } = helpers;
const { CAMERA_STATUS, SELECTED_DEVICE_CHANGED, MEDIA_DEVICE_LIST_CHANGED } =
  CameraControllerEvents;

const cameraState: CameraState = proxy({
  deviceId: '',
  isPermissionGranted: false,
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
    const success = await camera.start(frameWidth, frameHeight);
    if (!success) {
      notificationState.showNotification(
        NotificationTypes.Error,
        i18next.t('WEB_CAMERA_START_ERROR')
      );
      return;
    }
    const { cameraWidth, cameraHeight, cameraFrameRate } = camera;
    cameraState.trackinfo = {
      cameraWidth,
      cameraHeight,
      cameraFrameRate,
    };
  },
  stop: () => {
    camera.stop();
    cameraState.trackinfo = { cameraWidth: 0, cameraHeight: 0, cameraFrameRate: 0 };
  },
  requestPermission: async () => {
    cameraState.isPermissionGranted = await camera.requestPermission();
  },
  listCameras: async () => {
    await camera.list();
    const mediaDevices: MediaDevice[] = camera.mediaDevices.map((mediaDevice) => ({
      device: { ...mediaDevice.device },
      capabilities: { ...mediaDevice.capabilities },
    }));
    cameraState.mediaDevices = [...mediaDevices];
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
