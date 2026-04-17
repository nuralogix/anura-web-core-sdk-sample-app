import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../state';
import useCanStartMeasurement from './useCanStartMeasurement';
import useMeasurementPhase from './useMeasurementPhase';
import { CAMERA_HEIGHT, CAMERA_WIDTH } from '../config/constants';
import loggerState from '../state/logger/state';
import { logCategory, logMessages } from '../state/logger/types';
import generalState from '../state/general/state';
import { ErrorCodes } from '../types';

/**
 * Custom hook to handle auto-start functionality for camera and measurement
 */
export const useAutoStart = () => {
  const { config } = useSnapshot(state.config);
  const { isPermissionGranted, deviceId, isOpen } = useSnapshot(state.camera);
  const { faceTrackerState } = useSnapshot(state.measurement);
  const canStartMeasurement = useCanStartMeasurement();
  const { isIdle } = useMeasurementPhase();

  /**
   * Auto-start camera if cameraAutoStart is enabled
   * Only runs when: config enabled, permission granted, device selected, camera not open
   */
  useEffect(() => {
    if (!config.cameraAutoStart || !isIdle) return;

    if (isPermissionGranted && deviceId && !isOpen) {
      // Simply start the camera with the already-selected deviceId
      (async () => {
        const success = await state.camera.start(CAMERA_WIDTH, CAMERA_HEIGHT);
        if (success) {
          loggerState.addLog(logMessages.CAMERA_STARTED, logCategory.camera);
          state.measurement.setMaskVisibility(true);
        } else {
          loggerState.addLog(logMessages.CAMERA_START_FAILED, logCategory.camera);
          generalState.setErrorCode(ErrorCodes.CAMERA_START_FAILED);
        }
      })();
    }
  }, [config.cameraAutoStart, isPermissionGranted, deviceId, isOpen, isIdle]);

  /**
   * Auto-start measurement if measurementAutoStart is enabled
   * Only runs when: config enabled, tracker ready, face detected, not in progress, not waiting for results, device selected, camera open
   */
  useEffect(() => {
    if (!config.measurementAutoStart) return;

    if (canStartMeasurement) {
      (async () => {
        await state.measurement.startMeasurement();
      })();
    }
  }, [config.measurementAutoStart, faceTrackerState, canStartMeasurement]);
};
