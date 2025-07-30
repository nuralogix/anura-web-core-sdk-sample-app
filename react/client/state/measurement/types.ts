import type {
  Demographics,
  FaceTrackerState,
  MeasurementOptions,
  Results,
} from '@nuralogix.ai/anura-web-core-sdk';

export interface MeasurementState {
  assetFolder: string;
  apiUrl: string;
  faceTrackerState: FaceTrackerState;
  percentDownloaded: number;
  isMeasurementInProgress: boolean;
  isMeasurementComplete: boolean;
  isAnalyzingResults: boolean;
  shouldDestroy: boolean;
  warningMessage: string;
  results: Results[];
  init: (mediaElement: HTMLDivElement) => Promise<void>;
  setTrackerState: (state: FaceTrackerState) => void;
  setApiUrl: (apiUrl: string) => void;
  getVersion: () =>
    | {
        webSDK: string;
        extractionLib: {
          version: string;
          sdkId: string;
        };
        faceTracker: string;
      }
    | undefined;
  reset: () => Promise<boolean>;
  destroy: () => Promise<void>;
  prepare: () => Promise<void>;
  setMediaStream: (mediaStream: MediaStream) => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  startMeasurement: (measurementOptions?: MeasurementOptions) => Promise<void>;
  setDemographics: (demographics: Demographics) => void;
  setMaskVisibility: (visibility: boolean) => void;
  setMaskLoadingState: (loading: boolean) => void;
}
