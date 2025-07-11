import React from 'react';
import { RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FormField from './FormField';
import { FormState } from './types';

interface MedicalQuestionnaireProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const MedicalQuestionnaire: React.FC<MedicalQuestionnaireProps> = ({ formState, setFormState }) => {
  const { t } = useTranslation();

  const yesNoOptions = [
    { value: 'yes', label: t('YES') },
    { value: 'no', label: t('NO') },
  ];

  const diabetesStatusOptions = [
    { value: 'type1', label: t('TYPE_1') },
    { value: 'type2', label: t('TYPE_2') },
    { value: 'no', label: t('NO') },
  ];

  const handleSmokingChange = (value: string) => {
    setFormState((prev) => ({ ...prev, smoking: value }));
  };

  const handleBloodPressureMedChange = (value: string) => {
    setFormState((prev) => ({ ...prev, bloodPressureMed: value }));
  };

  const handleDiabetesStatusChange = (value: string) => {
    setFormState((prev) => ({ ...prev, diabetesStatus: value }));
  };

  return (
    <>
      <FormField>
        <RadioButtonGroup
          direction="row"
          label={t('PROFILE_FORM_SMOKING_LABEL')}
          value={formState.smoking}
          onChange={handleSmokingChange}
          options={yesNoOptions}
        />
      </FormField>

      <FormField>
        <RadioButtonGroup
          direction="row"
          label={t('PROFILE_FORM_BLOOD_PRESSURE_LABEL')}
          value={formState.bloodPressureMed}
          onChange={handleBloodPressureMedChange}
          options={yesNoOptions}
        />
      </FormField>

      <FormField>
        <RadioButtonGroup
          direction="row"
          label={t('PROFILE_FORM_DIABETES_LABEL')}
          value={formState.diabetesStatus}
          onChange={handleDiabetesStatusChange}
          options={diabetesStatusOptions}
        />
      </FormField>
    </>
  );
};

export default MedicalQuestionnaire;
