import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';
import { SmokingStatus } from '../types';

interface SmokingFieldProps {
  value: SmokingStatus;
  onChange: (value: SmokingStatus) => void;
}

const SmokingField: React.FC<SmokingFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const smokingOptions = [
    { value: 'yes', label: t('YES') },
    { value: 'no', label: t('NO') },
  ];

  const handleChange = (value: string) => {
    onChange(value as SmokingStatus);
  };

  return (
    <FieldWrapper>
      <RadioButtonGroup
        direction="row"
        label={t('PROFILE_FORM_SMOKING_LABEL')}
        value={value}
        onChange={handleChange}
        options={smokingOptions}
      />
    </FieldWrapper>
  );
};

export default SmokingField;
