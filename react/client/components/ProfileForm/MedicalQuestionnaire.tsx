import React from 'react';
import { Button } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import { SmokingField, BloodPressureMedField, DiabetesStatusField } from './Fields';
import { FormState, SmokingStatus, BloodPressureMedStatus, DiabetesStatus } from './types';
import { isMedicalQuestionnaireValid } from './validationUtils';

const styles = stylex.create({
  buttonWrapper: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  },
});

interface MedicalQuestionnaireProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: () => void;
  onBack: () => void;
}

const MedicalQuestionnaire: React.FC<MedicalQuestionnaireProps> = ({
  formState,
  setFormState,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();

  const handleSmokingChange = (value: SmokingStatus) => {
    setFormState((prev) => ({ ...prev, smoking: value }));
  };

  const handleBloodPressureMedChange = (value: BloodPressureMedStatus) => {
    setFormState((prev) => ({ ...prev, bloodPressureMed: value }));
  };

  const handleDiabetesStatusChange = (value: DiabetesStatus) => {
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
      <div {...stylex.props(styles.buttonWrapper)}>
        <Button width="100%" onClick={onSubmit} disabled={!isMedicalQuestionnaireValid(formState)}>
          {t('PROFILE_FORM_SUBMIT_BUTTON')}
        </Button>
        <Button variant="link" onClick={onBack}>
          {t('BACK')}
        </Button>
      </div>
    </>
  );
};

export default MedicalQuestionnaire;
