import { Paragraph, Modal } from '@nuralogix.ai/web-ui';
import CameraPermissionsNotGranted from '../../components/CameraPermissionsNotGranted';
import { ErrorCodes } from '../../types';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { isModalErrorCode } from './constants';

type ErrorMessageProps = {
  errorCode: ErrorCodes;
  onClear: () => void;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorCode, onClear }) => {
  const { t } = useTranslation();

  if (errorCode === ErrorCodes.CAMERA_PERMISSION_DENIED) {
    return <CameraPermissionsNotGranted />; // Non-closable custom overlay
  }

  if (isModalErrorCode(errorCode)) {
    return (
      <Modal isOpen variant="danger" onClose={onClear} showConfirmButton={false}>
        <Paragraph>{t(errorCode)}</Paragraph>
      </Modal>
    );
  }

  return null;
};

export default ErrorMessage;
