import React, { useState } from 'react';
import { TextInput } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';

interface MetricHeightFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const MetricHeightField: React.FC<MetricHeightFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);

  const isInvalid = () => {
    if (!value) return false;
    const heightNum = parseInt(value);
    return isNaN(heightNum) || heightNum < 120 || heightNum > 220;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <FieldWrapper>
      <TextInput
        label={t('PROFILE_FORM_HEIGHT_LABEL_METRIC')}
        value={value}
        onChange={handleChange}
        placeholder={t('PROFILE_FORM_HEIGHT_PLACEHOLDER_METRIC')}
        type="text"
        invalid={touched && isInvalid()}
        invalidMessage={t('PROFILE_FORM_VALIDATION_HEIGHT_METRIC')}
        onBlur={handleBlur}
      />
    </FieldWrapper>
  );
};

export default MetricHeightField;
