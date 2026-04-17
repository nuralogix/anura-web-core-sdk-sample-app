import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../state';

export const useAttachMediaStream = () => {
  const { isOpen, cameraStream } = useSnapshot(state.camera);
  const { isFaceTrackerLoaded } = useSnapshot(state.measurement);

  useEffect(() => {
    const attachStream = async () => {
      if (isOpen && cameraStream && isFaceTrackerLoaded) {
        await state.measurement.setMediaStream(cameraStream);
      }
    };
    attachStream();
  }, [isOpen, cameraStream, isFaceTrackerLoaded]);
};

export default useAttachMediaStream;
