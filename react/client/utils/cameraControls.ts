import state from '../state';
import { MeasurementPhase } from '../state/measurement/types';
import { CAMERA_WIDTH, CAMERA_HEIGHT } from '../config/constants';
import loggerState from '../state/logger/state';
import { logCategory, logMessages } from '../state/logger/types';
import generalState from '../state/general/state';
import { ErrorCodes } from '../types';

/**
 * Stop camera stream and hide mask. Does NOT reset measurement or reinit mask.
 * For turning off camera when results being analyzed.
 */
export const stopCameraStream = () => {
  if (state.camera.isOpen) {
    state.camera.stop();
    state.measurement.setMaskVisibility(false);
  }
};

/**
 * Perform a full measurement stop, for use when user cancels measurement:
 * - Stop stream
 * - Hide mask
 * - Reset measurement & reinitialize mask on success
 */
export const stopMeasurementAndReset = async () => {
  stopCameraStream();
  const measurementId = state.measurement.measurementId;
  state.measurement.measurementPhase = MeasurementPhase.Resetting;
  try {
    const ok = await state.measurement.reset();
    if (ok) {
      loggerState.addLog(logMessages.MEASUREMENT_CANCELED_BY_USER, logCategory.measurement, {
        measurementId,
      });
      state.measurement.reinitMask();
    }
  } catch (e) {
    loggerState.addLog(logMessages.CAMERA_STOP_RESET_FAILED, logCategory.camera, {
      error: (e as Error).message,
    });
  }
};

/**
 * Start camera stream and show mask.
 */
export const startCameraStream = async () => {
  const success = await state.camera.start(CAMERA_WIDTH, CAMERA_HEIGHT);
  if (success) {
    loggerState.addLog(logMessages.CAMERA_STARTED, logCategory.camera);
    state.measurement.setMaskVisibility(true);
  } else {
    loggerState.addLog(logMessages.CAMERA_START_FAILED, logCategory.camera);
    generalState.setErrorCode(ErrorCodes.CAMERA_START_FAILED);
  }
  return success;
};

export default {
  stopCameraStream,
  stopMeasurementAndReset,
  startCameraStream,
};
