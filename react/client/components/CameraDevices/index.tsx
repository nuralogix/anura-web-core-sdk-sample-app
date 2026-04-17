import { useEffect, ReactNode } from 'react';
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
  const { isPermissionGranted, enumerationPhase, mediaDevices } = cameraSnap;
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    (async () => {
      if (isPermissionGranted && enumerationPhase === CameraEnumerationPhase.Idle) {
        await state.camera.listCameras();
      }
    })();
  }, [isPermissionGranted, enumerationPhase]);

  const isEnumerating = enumerationPhase === CameraEnumerationPhase.Enumerating;
  const isDone = enumerationPhase === CameraEnumerationPhase.Done;
  const hasDevices = mediaDevices.length > 0;

  let content: ReactNode = null;

  if (isEnumerating) {
    content = <Loading small />;
  } else if (isDone && !hasDevices) {
    content = <Paragraph variant="error">{t('NO_DEVICES_FOUND')}</Paragraph>;
  } else if (!configSnap.config.cameraAutoStart && !isMobile) {
    // Only show selector when auto start is disabled and not on mobile
    content = <CameraSelector />;
  }

  return content;
};

export default CameraDevices;
