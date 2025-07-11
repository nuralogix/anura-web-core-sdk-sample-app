import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';
import { DiabetesStatus } from '../types';

interface DiabetesStatusFieldProps {
  value: DiabetesStatus;
  onChange: (value: DiabetesStatus) => void;
}

const DiabetesStatusField: React.FC<DiabetesStatusFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const diabetesStatusOptions = [
    { value: 'type1', label: t('TYPE_1') },
    { value: 'type2', label: t('TYPE_2') },
    { value: 'no', label: t('NO') },
  ];

  const handleChange = (value: string) => {
    onChange(value as DiabetesStatus);
  };

  return (
    <FieldWrapper>
      <RadioButtonGroup
        direction="row"
        label={t('PROFILE_FORM_DIABETES_LABEL')}
        value={value}
        onChange={handleChange}
        options={diabetesStatusOptions}
      />
    </FieldWrapper>
  );
};

export default DiabetesStatusField;
