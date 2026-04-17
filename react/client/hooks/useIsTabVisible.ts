import { useCallback, useEffect, useState } from 'react';
import loggerState from '../state/logger/state';
import { logCategory, logMessages } from '../state/logger/types';

export const useIsTabVisible = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  const handleVisibility = useCallback(() => {
    setIsVisible(!document.hidden);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [handleVisibility]);

  useEffect(() => {
    // TODO: See if you need to stop the camera and the measurement when the tab is not visible
    loggerState.addLog(logMessages.PAGE_VISIBILITY_CHANGE, logCategory.app, { isVisible });
  }, [isVisible]);

  return isVisible;
};
