import { useSnapshot } from 'valtio';
import state from '../state';
import { MeasurementPhase } from '../state/measurement/types';

export const useMeasurementPhase = () => {
  const { measurementPhase } = useSnapshot(state.measurement);

  return {
    measurementPhase,
    isIdle: measurementPhase === MeasurementPhase.Idle,
    isInProgress: measurementPhase === MeasurementPhase.InProgress,
    isAnalyzing: measurementPhase === MeasurementPhase.Analyzing,
    isComplete: measurementPhase === MeasurementPhase.Complete,
    isResetting: measurementPhase === MeasurementPhase.Resetting,
  } as const;
};

export default useMeasurementPhase;
