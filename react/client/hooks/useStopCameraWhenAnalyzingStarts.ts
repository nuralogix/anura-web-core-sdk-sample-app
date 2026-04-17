import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../state';
import useMeasurementPhase from './useMeasurementPhase';
import loggerState from '../state/logger/state';
import { logCategory, logMessages } from '../state/logger/types';
import { stopCameraStream } from '../utils/cameraControls';

export const useStopCameraWhenAnalyzingStarts = () => {
  const { isAnalyzing } = useMeasurementPhase();
  const { isOpen } = useSnapshot(state.camera);
  useEffect(() => {
    if (isAnalyzing && isOpen) {
      stopCameraStream();
      loggerState.addLog(logMessages.CAMERA_STOPPED_AT_ANALYZING_START, logCategory.camera);
    }
  }, [isAnalyzing, isOpen]);
};
export default useStopCameraWhenAnalyzingStarts;
