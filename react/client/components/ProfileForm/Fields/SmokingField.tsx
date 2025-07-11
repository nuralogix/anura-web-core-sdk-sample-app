import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FieldWrapper from '../FieldWrapper';

interface SmokingFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const SmokingField: React.FC<SmokingFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const smokingOptions = [
    { value: 'yes', label: t('YES') },
    { value: 'no', label: t('NO') },
  ];

  return (
    <FieldWrapper>
      <RadioButtonGroup
        direction="row"
        label={t('PROFILE_FORM_SMOKING_LABEL')}
        value={value}
        onChange={onChange}
        options={smokingOptions}
      />
    </FieldWrapper>
  );
};

export default SmokingField;
