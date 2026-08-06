import { useEffect, useRef, ReactNode } from 'react';
import { useSnapshot } from 'valtio';
import state from '../../state';
import CameraSelector from '../CameraSelector';
import { Loading, Paragraph } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import { CameraEnumerationPhase } from '../../state/camera/types';
import useIsMobile from '../../hooks/useIsMobile';

const CameraDevices = () => {
  const cameraSnap = useSnapshot(state.camera);
  const configSnap = useSnapshot(state.config);
  const { isPermissionGranted, enumerationPhase, mediaDevices, isOpen } = cameraSnap;
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Enumerate once after permission. Not gated on enumerationPhase: on iOS the SDK's
  // own devicechange handler can mark enumeration Done before this runs, which would
  // skip listCameras and drop the defaultCameraId selection.
  const hasEnumeratedRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (isPermissionGranted && !hasEnumeratedRef.current) {
        hasEnumeratedRef.current = true;
        await state.camera.listCameras();
      }
    })();
  }, [isPermissionGranted]);

  const isEnumerating = enumerationPhase === CameraEnumerationPhase.Enumerating;
  const isDone = enumerationPhase === CameraEnumerationPhase.Done;
  const hasDevices = mediaDevices.length > 0;

  let content: ReactNode = null;

  if (isEnumerating) {
    content = <Loading small />;
  } else if (isDone && !hasDevices) {
    content = <Paragraph variant="error">{t('NO_DEVICES_FOUND')}</Paragraph>;
  } else if (
    !configSnap.config.cameraAutoStart &&
    !configSnap.config.cameraFacingMode &&
    !isMobile &&
    !isOpen
  ) {
    // Only show selector when auto start is disabled, no facing mode is set, not on mobile, and no
    // camera is open. When cameraFacingMode is set the browser chooses the device (it takes
    // precedence over defaultCameraId), so a manual picker would be meaningless. Once a camera is
    // open, the user must close it before switching devices.
    content = <CameraSelector />;
  }

  return content;
};

export default CameraDevices;
