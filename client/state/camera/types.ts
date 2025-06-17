import { type CameraStatusChanged } from '@nuralogix.ai/anura-web-core-sdk/helpers';

export type VideoTrackCapabilities = CameraStatusChanged['detail']['capabilities'];

export interface MediaDevice {
  device: {
    label: string;
    deviceId: string;
    kind: 'videoinput';
    groupId: string;
  };
  capabilities: MediaTrackCapabilities;
}

export interface TrackInfo {
  cameraWidth: number;
  cameraHeight: number;
  cameraFrameRate: number;
}

export type CameraStream = (MediaStream & { $$valtioSnapshot: MediaStream }) | null;

export interface CameraState {
  deviceId: string;
  isPermissionGranted: boolean;
  isOpen: boolean;
  capabilities: VideoTrackCapabilities | null;
  mediaDevices: MediaDevice[];
  cameraStream: CameraStream;
  trackinfo: TrackInfo;
  start(frameWidth: number, frameHeight: number): Promise<void>;
  stop(): void;
  requestPermission(): Promise<void>;
  listCameras(): Promise<void>;
  updateDeviceId(deviceId: string): void;
}
