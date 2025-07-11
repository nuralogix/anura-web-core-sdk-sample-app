import React, { useState } from 'react';
import { Heading, Button, Card, Paragraph } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import ProfileInfo from './ProfileInfo';
import MedicalQuestionnaire from './MedicalQuestionnaire';
import { FormState, WizardStep } from './types';
import { isProfileInfoValid, isMedicalQuestionnaireValid } from './validationUtils';
import { INITIAL_FORM_STATE, WIZARD_STEPS } from './constants';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  card: {
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
  },
  buttonWrapper: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  singleButton: {
    display: 'flex',
    justifyContent: 'center',
  },
  introMessage: {
    marginBottom: '24px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
});

const FormWizard = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>(WIZARD_STEPS.PROFILE);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

  const handleNextStep = () => {
    if (currentStep === WIZARD_STEPS.PROFILE && isProfileInfoValid(formState)) {
      setCurrentStep(WIZARD_STEPS.MEDICAL);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === WIZARD_STEPS.MEDICAL) {
      setCurrentStep(WIZARD_STEPS.PROFILE);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted with data:', formState);
    // Add logic for final submission
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case WIZARD_STEPS.PROFILE:
        return <ProfileInfo formState={formState} setFormState={setFormState} />;
      case WIZARD_STEPS.MEDICAL:
        return <MedicalQuestionnaire formState={formState} setFormState={setFormState} />;
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (currentStep === WIZARD_STEPS.PROFILE) {
      return (
        <div {...stylex.props(styles.singleButton)}>
          <Button onClick={handleNextStep} disabled={!isProfileInfoValid(formState)}>
            {t('NEXT')}
          </Button>
        </div>
      );
    }

    if (currentStep === WIZARD_STEPS.MEDICAL) {
      return (
        <div {...stylex.props(styles.buttonWrapper)}>
          <Button variant="outline" onClick={handlePreviousStep}>
            {t('PREVIOUS')}
          </Button>
          <Button onClick={handleSubmit} disabled={!isMedicalQuestionnaireValid(formState)}>
            {t('PROFILE_FORM_SUBMIT_BUTTON')}
          </Button>
        </div>
      );
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case WIZARD_STEPS.PROFILE:
        return t('PROFILE_FORM_STEP_1_TITLE');
      case WIZARD_STEPS.MEDICAL:
        return t('PROFILE_FORM_STEP_2_TITLE');
    }
  };

  return (
    <div {...stylex.props(styles.wrapper)}>
      <Card xstyle={styles.card}>
        <Heading>{getStepTitle()}</Heading>
        <div {...stylex.props(styles.introMessage)}>
          <Paragraph>{t('PROFILE_FORM_INTRO_MESSAGE')}</Paragraph>
        </div>
        {renderStepContent()}
        {renderButtons()}
      </Card>
    </div>
  );
};

export default FormWizard;
