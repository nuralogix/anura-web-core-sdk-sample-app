export const logMessages = {
  CHUNK_SENT: 'Chunk sent',
  COLLECTOR_ERROR: 'Collector Error',
  FACE_NOT_DETECTED: 'No face detected',
  MEDIA_ELEMENT_RESIZED: 'Media element resized',
} as const;

export enum logCategory {
  measurement = 'Measurement',
  collector = 'Collector',
}
export interface Log {
  timestamp: string;
  category: logCategory;
  message: string;
  meta?: any;
}

export interface LoggerState {
  logs: Log[];
  addLog: (message: string, category: logCategory, meta?: any) => void;
  clearLogs: () => void;
}
