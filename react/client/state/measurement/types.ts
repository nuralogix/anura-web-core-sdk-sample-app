import type {
  Demographics,
  FaceTrackerState,
  MeasurementOptions,
  DFXResults,
  Measurement,
} from '@nuralogix.ai/anura-web-core-sdk';
import type { ConstraintCode } from './utils';

/**
 * Full profile: every field is required. This is the default (and the only
 * shape before partial profiles were supported), so existing code that builds
 * profiles without `partialProfile` keeps its behaviour and type checks.
 */
export interface FullProfile extends Required<Omit<Demographics, 'height' | 'weight'>> {
  heightCm: number;
  weightKg: number;
  bypassProfile: boolean;
  partialProfile?: false;
}

/**
 * Partial profile: any subset of fields. Only the fields provided are
 * validated and sent to the SDK; the backend only considers what it receives.
 */
export interface PartialProfile extends Omit<Demographics, 'height' | 'weight'> {
  heightCm?: number;
  weightKg?: number;
  bypassProfile: boolean;
  partialProfile: true;
}

export type Profile = FullProfile | PartialProfile;

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
  getVersion: () => ReturnType<Measurement['getVersion']>;
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
