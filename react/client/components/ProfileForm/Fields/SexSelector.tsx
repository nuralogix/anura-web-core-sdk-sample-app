import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';

interface SexSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const SexSelector: React.FC<SexSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const sexOptions = [
    { value: 'male', label: t('MALE') },
    { value: 'female', label: t('FEMALE') },
  ];

  return (
    <RadioButtonGroup
      direction="row"
      label={t('PROFILE_FORM_SEX_LABEL')}
      value={value}
      onChange={onChange}
      options={sexOptions}
    />
  );
};

export default SexSelector;
