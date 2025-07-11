import React, { useState } from 'react';
import { TextInput } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';

interface HeightInputProps {
  heightMetric: string;
  heightFeet: string;
  heightInches: string;
  onMetricHeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFeetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInchesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMetric: boolean;
}

const HeightInput: React.FC<HeightInputProps> = ({
  heightMetric,
  heightFeet,
  heightInches,
  onMetricHeightChange,
  onFeetChange,
  onInchesChange,
  isMetric,
}) => {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);
  const [feetTouched, setFeetTouched] = useState(false);
  const [inchesTouched, setInchesTouched] = useState(false);

  const isMetricInvalid = () => {
    if (!heightMetric) return false;
    const heightNum = parseInt(heightMetric);
    return isNaN(heightNum) || heightNum < 120 || heightNum > 220;
  };

  const isFeetInvalid = () => {
    if (!heightFeet) return false;
    const feet = parseInt(heightFeet);
    return isNaN(feet) || feet < 3 || feet > 7;
  };

  const isInchesInvalid = () => {
    if (!heightInches) return false;
    const inches = parseInt(heightInches);
    return isNaN(inches) || inches < 0 || inches > 11;
  };

  const handleMetricBlur = () => {
    setTouched(true);
  };

  const handleFeetBlur = () => {
    setFeetTouched(true);
  };

  const handleInchesBlur = () => {
    setInchesTouched(true);
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMetricHeightChange(e);
  };

  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFeetChange(e);
  };

  const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInchesChange(e);
  };

  if (isMetric) {
    return (
      <TextInput
        label={t('PROFILE_FORM_HEIGHT_LABEL_METRIC')}
        value={heightMetric}
        onChange={handleMetricChange}
        placeholder={t('PROFILE_FORM_HEIGHT_PLACEHOLDER_METRIC')}
        type="text"
        invalid={touched && isMetricInvalid()}
        invalidMessage={t('PROFILE_FORM_VALIDATION_HEIGHT_METRIC')}
        onBlur={handleMetricBlur}
      />
    );
  }

  return (
    <>
      <TextInput
        label={t('PROFILE_FORM_HEIGHT_FEET_LABEL')}
        value={heightFeet}
        onChange={handleFeetChange}
        placeholder="5"
        type="text"
        invalid={feetTouched && isFeetInvalid()}
        invalidMessage={t('PROFILE_FORM_VALIDATION_HEIGHT_FEET')}
        onBlur={handleFeetBlur}
      />
      <TextInput
        label={t('PROFILE_FORM_HEIGHT_INCHES_LABEL')}
        value={heightInches}
        onChange={handleInchesChange}
        placeholder="11"
        type="text"
        invalid={inchesTouched && isInchesInvalid()}
        invalidMessage={t('PROFILE_FORM_VALIDATION_HEIGHT_INCHES')}
        onBlur={handleInchesBlur}
      />
    </>
  );
};

export default HeightInput;
