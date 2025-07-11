import React from 'react';
import SmokingField from './Fields/SmokingField';
import BloodPressureMedField from './Fields/BloodPressureMedField';
import DiabetesStatusField from './Fields/DiabetesStatusField';
import { FormState } from './types';

interface MedicalQuestionnaireProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const MedicalQuestionnaire: React.FC<MedicalQuestionnaireProps> = ({ formState, setFormState }) => {
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
      <SmokingField value={formState.smoking} onChange={handleSmokingChange} />
      <BloodPressureMedField
        value={formState.bloodPressureMed}
        onChange={handleBloodPressureMedChange}
      />
      <DiabetesStatusField value={formState.diabetesStatus} onChange={handleDiabetesStatusChange} />
    </>
  );
};

export default MedicalQuestionnaire;
