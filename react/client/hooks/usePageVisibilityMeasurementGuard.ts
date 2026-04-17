import { useEffect } from 'react';
import useMeasurementPhase from './useMeasurementPhase';
import { useIsTabVisible } from './useIsTabVisible';
import loggerState from '../state/logger/state';
import generalState from '../state/general/state';
import { logCategory, logMessages } from '../state/logger/types';
import { ErrorCodes } from '../types';

// Emits an error/log when measurement is in progress but tab is hidden.
export const usePageVisibilityMeasurementGuard = () => {
  const isTabVisible = useIsTabVisible();
  const { isInProgress } = useMeasurementPhase();
  useEffect(() => {
    if (!isTabVisible && isInProgress) {
      loggerState.addLog(logMessages.PAGE_NOT_VISIBLE, logCategory.app);
      generalState.setErrorCode(ErrorCodes.PAGE_NOT_VISIBLE);
    }
  }, [isTabVisible, isInProgress]);
};

export default usePageVisibilityMeasurementGuard;
