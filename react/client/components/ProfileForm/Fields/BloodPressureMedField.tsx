import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';
import { BloodPressureMedStatus } from '../types';

interface BloodPressureMedFieldProps {
  value: BloodPressureMedStatus;
  onChange: (value: BloodPressureMedStatus) => void;
}

const BloodPressureMedField: React.FC<BloodPressureMedFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const bloodPressureMedOptions = [
    { value: 'yes', label: t('YES') },
    { value: 'no', label: t('NO') },
  ];

  const handleChange = (value: string) => {
    onChange(value as BloodPressureMedStatus);
  };

  return (
    <FieldWrapper>
      <RadioButtonGroup
        direction="row"
        label={t('PROFILE_FORM_BLOOD_PRESSURE_LABEL')}
        value={value}
        onChange={handleChange}
        options={bloodPressureMedOptions}
      />
    </FieldWrapper>
  );
};

export default BloodPressureMedField;
