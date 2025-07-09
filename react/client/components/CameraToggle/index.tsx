import React, { useEffect }  from 'react';
import {
  type Demographics,
  faceAttributeValue,
} from '@nuralogix.ai/anura-web-core-sdk';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { useTranslation } from 'react-i18next';
import { Button } from '@nuralogix.ai/web-ui';

const CameraToggle: React.FC = () => {
  const { t } = useTranslation();
  const cameraSnap = useSnapshot(state.camera);
  const measurementSnap = useSnapshot(state.measurement);
  const { isOpen, deviceId } = cameraSnap;
  const {
    setMaskVisibility,
    stopTracking,
    setDemographics,
    isMeasurementComplete
  } = measurementSnap;

  const toggle = async () => {
    if (isOpen) {
      state.camera.stop();
      await stopTracking();
      setMaskVisibility(false);
    } else {
      const demographics: Demographics = {
        age: 40,
        height: 180,
        weight: 60,
        sex: faceAttributeValue.SEX_ASSIGNED_MALE_AT_BIRTH,
        smoking: faceAttributeValue.SMOKER_FALSE,
        bloodPressureMedication: faceAttributeValue.BLOOD_PRESSURE_MEDICATION_FALSE,
        diabetes: faceAttributeValue.DIABETES_NONE,
        unit: 'Metric',
      };
      setDemographics(demographics);
      const success = await state.camera.start(1280, 720);
    }
  };

  useEffect(() => {
    const toggleCamera = async () => {
      await toggle();
    }
    if (isMeasurementComplete) toggleCamera();
  } , [isMeasurementComplete]);

  return (
    <Button disabled={!deviceId} onClick={toggle}>
      {isOpen ? t('STOP_CAMERA') : t('WEB_BTN_START_CAMERA')}
    </Button>
  );
};

export default CameraToggle;