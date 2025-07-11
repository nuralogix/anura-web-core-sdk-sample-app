import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';

interface UnitSelectorProps {
  value: 'metric' | 'imperial';
  onChange: (value: 'metric' | 'imperial') => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const unitOptions = [
    { value: 'metric', label: t('METRIC') },
    { value: 'imperial', label: t('IMPERIAL') },
  ];

  const handleChange = (value: string) => {
    onChange(value as 'metric' | 'imperial');
  };

  return (
    <FieldWrapper>
      <RadioButtonGroup
        direction="row"
        label={t('PROFILE_FORM_UNIT_LABEL')}
        value={value}
        onChange={handleChange}
        options={unitOptions}
      />
    </FieldWrapper>
  );
};

export default UnitSelector;
