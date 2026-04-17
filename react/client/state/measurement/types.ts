import type {
  Demographics,
  FaceTrackerState,
  MeasurementOptions,
  DFXResults,
} from '@nuralogix.ai/anura-web-core-sdk';
import type { ConstraintCode } from './utils';

export interface Profile extends Omit<Demographics, 'height' | 'weight'> {
  heightCm: number;
  weightKg: number;
  bypassProfile: boolean;
}

export enum MeasurementPhase {
  Idle = 'idle',
  InProgress = 'inProgress',
  Analyzing = 'analyzing',
  Complete = 'complete',
  Resetting = 'resetting',
}

export interface MeasurementState {
  assetFolder: string;
  appPath: string;
  apiUrl: string | undefined;
  faceTrackerState: FaceTrackerState;
  isFaceTrackerLoaded: boolean;
  constraintsSatisfiedStable: boolean;
  constraintCode: ConstraintCode | null;
  percentDownloaded: number;
  measurementPhase: MeasurementPhase;
  measurementId: string;
  token: string;
  refreshToken: string;
  studyId: string;
  measurementOptions: MeasurementOptions;
  isInitialized: boolean;
  results: DFXResults[];
  profile: Profile;
  finalChunkNumber: number;
  init: (mediaElement: HTMLDivElement) => Promise<void>;
  setTrackerState: (state: FaceTrackerState) => void;
  setApiUrl: (apiUrl: string | undefined) => void;
  getVersion: () => {
    webSDK: string;
    extractionLib: {
      version: string;
      sdkId: string;
    };
    faceTracker: string;
  };
  reset: () => Promise<boolean>;
  resetSession: () => void;
  resetRun: () => void;
  destroy: () => Promise<boolean>;
  prepare: () => Promise<void>;
  setMediaStream: (mediaStream: MediaStream) => Promise<void>;
  startTracking: () => Promise<void>;
  startMeasurement: () => Promise<void>;
  setProfile: (profile: Profile) => boolean;
  setMaskVisibility: (visibility: boolean) => void;
  setAppSettings: (
    token: string,
    refreshToken: string,
    studyId: string,
    measurementOptions?: MeasurementOptions
  ) => boolean;
  setMaskLoadingState: (loading: boolean) => void;
  reinitMask: () => void;
  disconnect: () => Promise<void>;
}
