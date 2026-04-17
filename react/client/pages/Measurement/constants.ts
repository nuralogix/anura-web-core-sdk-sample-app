import { ErrorCodes } from '../../types';

// Error codes that should render the generic danger modal
export const MODAL_ERROR_CODES: ErrorCodes[] = [
  ErrorCodes.PAGE_NOT_VISIBLE,
  ErrorCodes.MEASUREMENT_LOW_SNR,
  ErrorCodes.WORKER_ERROR,
  ErrorCodes.ANALYSIS_ERROR,
  ErrorCodes.COLLECTOR,
  ErrorCodes.FACE_NONE,
  ErrorCodes.CAMERA_START_FAILED,
] as const;

// Error codes that require an immediate cancellation/reset before UI is shown
export const CANCEL_ON_ERROR_CODES: ErrorCodes[] = [
  ErrorCodes.PAGE_NOT_VISIBLE,
  ErrorCodes.MEASUREMENT_LOW_SNR,
  ErrorCodes.WORKER_ERROR,
  ErrorCodes.ANALYSIS_ERROR,
  ErrorCodes.COLLECTOR,
  ErrorCodes.FACE_NONE,
  ErrorCodes.WEBSOCKET_DISCONNECTED,
] as const;
export type CancelOnErrorCode = (typeof CANCEL_ON_ERROR_CODES)[number];

export const isCancelOnErrorCode = (code: ErrorCodes): code is CancelOnErrorCode =>
  (CANCEL_ON_ERROR_CODES as readonly ErrorCodes[]).includes(code);
export const isModalErrorCode = (code: ErrorCodes): boolean =>
  (MODAL_ERROR_CODES as readonly ErrorCodes[]).includes(code);
