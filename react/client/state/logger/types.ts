export const logMessages = {
  ANALYSIS_ERROR: 'Analysis error occurred',
  LIVENESS_ERROR: 'Liveness error occurred',
  CHUNK_SENT: 'Chunk sent',
  COLLECTOR_ERROR: 'Collector Error',
  FACE_NOT_DETECTED: 'No face detected',
  MEDIA_ELEMENT_RESIZED: 'Media element resized',
  UNSUPPORTED_BROWSER: 'Unsupported browser detected',
  CAMERA_START_FAILED: 'Camera failed to start',
  CAMERA_PERMISSION_DENIED: 'Camera permission denied',
  CAMERA_PERMISSION_GRANTED: 'Camera permission granted',
  NO_DEVICES_FOUND: 'No camera devices found',
  PAGE_NOT_VISIBLE: 'Page not visible during measurement',
  MEASUREMENT_LOW_SNR: 'Measurement canceled due to low SNR',
  MEASUREMENT_PREPARE_FAILED: 'Measurement preparation failed',
  PROFILE_INFO_NOT_SET: 'Profile info not set',
  WORKER_ERROR: 'Worker error occurred',
  PROFILE_INVALID: 'Profile invalid',
  PROFILE_SET: 'Profile set',
  MEASUREMENT_OPTIONS_INVALID: 'Measurement options invalid',
  CONSTRAINTS_UPDATED: 'Constraints updated',
  CAMERA_STOP_RESET_FAILED: 'Camera stop/reset failed',
  CAMERA_STOPPED_AT_ANALYZING_START: 'Camera stopped at analyzing start',
  HANDLING_EXTERNAL_ACTION: 'Handling external action',
  LANGUAGE_INITIALIZED: 'Language initialized',
  CONTAINER_ELEMENT_MOUNTED: 'Container element mounted',
  APP_CONFIG_IS_SET: 'App configuration is set',
  API_URL_SET: 'API URL is set',
  API_URL_NOT_SET: 'Optional API URL is not set',
  MEASUREMENT_OPTIONS_SET: 'Measurement options are set',
  MEASUREMENT_PREPARE_SUCCESS: 'Token pairs have been validated and renewed. The study config file has been downloaded.',
  ASSETS_DOWNLOADED: 'SDK assets downloaded and workers initialized successfully',
  PAGE_VISIBILITY_CHANGE: 'Page visibility changed',
  FACE_TRACKER_STATE_CHANGED: 'Face tracker state changed',
  CAMERA_STARTED: 'Camera started successfully',
  CONSTRAINT_VIOLATION: 'Constraint violation detected',
  ASSETS_DOWNLOAD_FAILED: 'Failed to download assets and initialize workers',
  TOKENS_AND_STUDY_ID_SET: 'Tokens and Study ID are set for SDK configuration',
  PAGE_UNLOADED: 'Page is being unloaded',
  SDK_NOT_INITIALIZED: 'SDK is not initialized',
  SDK_DESTROY_SUCCESS: 'SDK destroyed successfully',
  SDK_DESTROY_FAILED: 'SDK destroy failed',
  SDK_RESET_FAILED: 'SDK reset failed',
  SDK_RESET_SUCCESS: 'SDK reset successfully',
  APP_LOADED: 'App loaded',
  MEASUREMENT_CANCELED_BY_USER: 'Measurement canceled by user',
  FACE_TRACKER_LOADED: 'Face tracker loaded with SDK version info',
  INTERMEDIATE_RESULTS_RECEIVED: 'Intermediate results received',
  FINAL_RESULTS_RECEIVED: 'Final results received',
  MEASUREMENT_STARTED: 'Measurement started',
  MEASUREMENT_DEMOGRAPHICS_SET: 'Measurement demographics set',
  WEBSOCKET_DISCONNECTED: 'Websocket disconnected',
} as const;

export enum logCategory {
  measurement = 'Measurement',
  collector = 'Collector',
  camera = 'Camera',
  app = 'App',
}
export interface Log {
  timestamp: string;
  category: logCategory;
  message: string;
  meta?: any;
}

export interface LoggerState {
  saveLogs: boolean;
  logs: Log[];
  addLog: (message: string, category: logCategory, meta?: any) => void;
  clearLogs: () => void;
  getCategoryColor: (category: logCategory) => string;
  getLogs: () => Log[];
  setSaveLogs: (save: boolean) => void;
}
