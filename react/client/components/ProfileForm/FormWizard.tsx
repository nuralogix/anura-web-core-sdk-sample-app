import React, { useState, useEffect } from 'react';
import { Heading, Button, Card, Paragraph } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import ProfileInfo from './ProfileInfo';
import MedicalQuestionnaire from './MedicalQuestionnaire';
import { FormState, WizardStep } from './types';
import { isProfileInfoValid, isMedicalQuestionnaireValid, isFormValid } from './validationUtils';
import { INITIAL_FORM_STATE, WIZARD_STEPS } from './constants';
import { convertFormStateToSDKDemographics } from './conversionUtils';
import { useNavigate } from 'react-router';
import state from '../../state';

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
    maxWidth: '450px',
    width: '100%',
  },
  buttonWrapper: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  },
  nextButton: {
    marginTop: '32px',
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
  const navigate = useNavigate();

  // Clear height and weight values when unit changes
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      heightMetric: '',
      heightFeet: '',
      heightInches: '',
      weight: '',
    }));
  }, [formState.unit]);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Defensive validation check
    if (!isFormValid(formState)) {
      console.warn('Form submission attempted with invalid data');
      return;
    }

    try {
      // Convert form data to SDK format
      const demographicsData = convertFormStateToSDKDemographics(formState);

      // Update the demographics store
      state.demographics.setDemographics(demographicsData);

      console.log('Form submitted successfully:', formState);
      console.log('Converted demographics:', demographicsData);

      // Navigate to measurement page
      navigate('/measurement');
    } catch (error) {
      console.error('Error submitting form:', error);
      // TODO: Show error notification to user
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case WIZARD_STEPS.PROFILE:
        return <ProfileInfo formState={formState} setFormState={setFormState} />;
      case WIZARD_STEPS.MEDICAL:
        return <MedicalQuestionnaire formState={formState} setFormState={setFormState} />;
    }
  };

  const renderButtons = () => {
    if (currentStep === WIZARD_STEPS.PROFILE) {
      return (
        <div {...stylex.props(styles.nextButton)}>
          <Button width="100%" onClick={handleNextStep} disabled={!isProfileInfoValid(formState)}>
            {t('NEXT')}
          </Button>
        </div>
      );
    }

    if (currentStep === WIZARD_STEPS.MEDICAL) {
      return (
        <div {...stylex.props(styles.buttonWrapper)}>
          <Button width="100%" type="submit" disabled={!isMedicalQuestionnaireValid(formState)}>
            {t('PROFILE_FORM_SUBMIT_BUTTON')}
          </Button>
          <Button variant="link" onClick={handlePreviousStep}>
            {t('BACK')}
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
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          {renderButtons()}
        </form>
      </Card>
    </div>
  );
};

export default FormWizard;
