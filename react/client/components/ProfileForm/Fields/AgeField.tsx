import React, { useState } from 'react';
import { TextInput } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';

interface AgeFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const AgeField: React.FC<AgeFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);

  const isInvalid = () => {
    if (!value) return false;
    const ageNum = parseInt(value);
    return isNaN(ageNum) || ageNum < 13 || ageNum > 120;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <TextInput
      label={t('PROFILE_FORM_AGE_LABEL')}
      value={value}
      onChange={handleChange}
      placeholder={t('PROFILE_FORM_AGE_PLACEHOLDER')}
      invalid={touched && isInvalid()}
      invalidMessage={t('PROFILE_FORM_VALIDATION_AGE')}
      onBlur={handleBlur}
    />
  );
};

export default AgeField;
