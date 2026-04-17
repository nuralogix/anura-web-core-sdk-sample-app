import { useSnapshot } from 'valtio';
import state from '../state';
import { faceTrackerState as trackingState } from '@nuralogix.ai/anura-web-core-sdk';
import useMeasurementPhase from './useMeasurementPhase';

export const useCanStartMeasurement = () => {
  const measurementSnap = useSnapshot(state.measurement);
  const cameraSnap = useSnapshot(state.camera);
  const { isIdle } = useMeasurementPhase();
  const { READY } = trackingState;

  const can =
    measurementSnap.faceTrackerState === READY &&
    measurementSnap.constraintsSatisfiedStable &&
    isIdle &&
    !!cameraSnap.deviceId &&
    cameraSnap.isOpen;

  return can;
};

export default useCanStartMeasurement;
