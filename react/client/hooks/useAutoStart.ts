import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../state';
import useCanStartMeasurement from './useCanStartMeasurement';
import useMeasurementPhase from './useMeasurementPhase';
import { CAMERA_HEIGHT, CAMERA_WIDTH } from '../config/constants';

/**
 * Custom hook to handle auto-start functionality for camera and measurement
 */
export const useAutoStart = () => {
  const { config } = useSnapshot(state.config);
  const { isPermissionGranted, deviceId, isOpen } = useSnapshot(state.camera);
  const { faceTrackerState, isFaceTrackerLoaded } = useSnapshot(state.measurement);
  const canStartMeasurement = useCanStartMeasurement();
  const { isIdle } = useMeasurementPhase();

  /**
  * Auto-start camera if cameraAutoStart is enabled.
   * Gated on isFaceTrackerLoaded so the camera stream isn't acquired until the
   * SDK is ready to consume it via setMediaStream. Otherwise the stream sits
   * idle while tracker assets download, and mobile browsers can suspend an
   * unattached stream — leaving us with a frozen video feed and no mask.
  */
  useEffect(() => {
    if (!config.cameraAutoStart || !isIdle) return;

    if (isPermissionGranted && deviceId && !isOpen && isFaceTrackerLoaded) {
      // Simply start the camera with the already-selected deviceId
      (async () => {
        const success = await state.camera.start(CAMERA_WIDTH, CAMERA_HEIGHT);
        if (success) {
          state.measurement.setMaskVisibility(true);
        }
      })();
    }
  }, [config.cameraAutoStart, isPermissionGranted, deviceId, isOpen, isIdle, isFaceTrackerLoaded]);

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