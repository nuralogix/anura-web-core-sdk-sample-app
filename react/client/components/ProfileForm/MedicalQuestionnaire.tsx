import React from 'react';
import { Button } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import { SmokingField, BloodPressureMedField, DiabetesStatusField } from './Fields';
import { FormState } from './types';
import { isMedicalQuestionnaireValid } from './validationUtils';
import { createFieldHandler } from './utils';
import { FORM_FIELDS } from './constants';

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

  return (
    <>
      <SmokingField
        value={formState.smoking}
        onChange={createFieldHandler(FORM_FIELDS.SMOKING, setFormState)}
      />
      <BloodPressureMedField
        value={formState.bloodPressureMed}
        onChange={createFieldHandler(FORM_FIELDS.BLOOD_PRESSURE_MED, setFormState)}
      />
      <DiabetesStatusField
        value={formState.diabetesStatus}
        onChange={createFieldHandler(FORM_FIELDS.DIABETES_STATUS, setFormState)}
      />
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
