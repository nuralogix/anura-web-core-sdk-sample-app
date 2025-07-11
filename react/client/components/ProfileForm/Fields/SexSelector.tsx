import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';
import { Sex } from '../types';

interface SexSelectorProps {
  value: Sex;
  onChange: (value: Sex) => void;
}

const SexSelector: React.FC<SexSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const sexOptions = [
    { value: 'male', label: t('MALE') },
    { value: 'female', label: t('FEMALE') },
  ];

  const handleChange = (value: string) => {
    onChange(value as Sex);
  };

  return (
    <FieldWrapper>
      <RadioButtonGroup
        direction="row"
        label={t('PROFILE_FORM_SEX_LABEL')}
        value={value}
        onChange={handleChange}
        options={sexOptions}
      />
    </FieldWrapper>
  );
};

export default SexSelector;
