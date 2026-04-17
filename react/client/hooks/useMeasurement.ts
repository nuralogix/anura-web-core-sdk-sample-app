import { useAutoStart } from './useAutoStart';
import { useStopCameraWhenAnalyzingStarts } from './useStopCameraWhenAnalyzingStarts';
import { usePageVisibilityMeasurementGuard } from './usePageVisibilityMeasurementGuard';
import { useAttachMediaStream } from './useAttachMediaStream';
import { usePrepareMeasurement } from './usePrepareMeasurement';

// Orchestrates camera & measurement side-effects.
const useMeasurement = () => {
  useAutoStart();
  useStopCameraWhenAnalyzingStarts();
  usePageVisibilityMeasurementGuard();
  useAttachMediaStream();
  usePrepareMeasurement();
};

export default useMeasurement;
