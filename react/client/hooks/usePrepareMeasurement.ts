import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../state';

export const usePrepareMeasurement = () => {
  const { isInitialized } = useSnapshot(state.measurement);
  useEffect(() => {
    const prepareMeasurement = async () => {
      if (isInitialized) {
        await state.measurement.prepare();
      }
    };
    prepareMeasurement();
  }, [isInitialized]);
};

export default usePrepareMeasurement;
