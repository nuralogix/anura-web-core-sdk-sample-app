import React, { useState } from 'react';
import { TextInput } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';

interface WeightFieldProps {
  value: string;
  onChange: (value: string) => void;
  isMetric: boolean;
}

const WeightField: React.FC<WeightFieldProps> = ({ value, onChange, isMetric }) => {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);

  const isInvalid = () => {
    if (!value) return false;
    const weightNum = parseInt(value);
    if (isMetric) {
      return isNaN(weightNum) || weightNum < 30 || weightNum > 300;
    } else {
      return isNaN(weightNum) || weightNum < 66 || weightNum > 661; // roughly 30kg to 300kg in lbs
    }
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
        label={t(
          isMetric ? 'PROFILE_FORM_WEIGHT_LABEL_METRIC' : 'PROFILE_FORM_WEIGHT_LABEL_IMPERIAL'
        )}
        value={value}
        onChange={handleChange}
        placeholder={t(
          isMetric
            ? 'PROFILE_FORM_WEIGHT_PLACEHOLDER_METRIC'
            : 'PROFILE_FORM_WEIGHT_PLACEHOLDER_IMPERIAL'
        )}
        invalid={touched && isInvalid()}
        invalidMessage={t(
          isMetric
            ? 'PROFILE_FORM_VALIDATION_WEIGHT_METRIC'
            : 'PROFILE_FORM_VALIDATION_WEIGHT_IMPERIAL'
        )}
        onBlur={handleBlur}
      />
    </FieldWrapper>
  );
};

export default WeightField;
