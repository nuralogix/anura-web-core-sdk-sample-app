import React, { useState, useEffect } from 'react';
import { Heading, Card, Paragraph } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import ProfileInfo from './ProfileInfo';
import MedicalQuestionnaire from './MedicalQuestionnaire';
import { FormState, WizardStep } from './types';
import { isFormValid } from './validationUtils';
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
    setCurrentStep(WIZARD_STEPS.MEDICAL);
  };

  const handlePreviousStep = () => {
    setCurrentStep(WIZARD_STEPS.PROFILE);
  };

  const handleSubmit = () => {
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
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      // TODO: Show error notification to user
    }
  };

  return (
    <div {...stylex.props(styles.wrapper)}>
      <Card xstyle={styles.card}>
        <Heading>
          {currentStep === WIZARD_STEPS.PROFILE
            ? t('PROFILE_FORM_STEP_1_TITLE')
            : t('PROFILE_FORM_STEP_2_TITLE')}
        </Heading>
        <div {...stylex.props(styles.introMessage)}>
          <Paragraph>{t('PROFILE_FORM_INTRO_MESSAGE')}</Paragraph>
        </div>

        {currentStep === WIZARD_STEPS.PROFILE && (
          <ProfileInfo formState={formState} setFormState={setFormState} onNext={handleNextStep} />
        )}

        {currentStep === WIZARD_STEPS.MEDICAL && (
          <MedicalQuestionnaire
            formState={formState}
            setFormState={setFormState}
            onSubmit={handleSubmit}
            onBack={handlePreviousStep}
          />
        )}
      </Card>
    </div>
  );
};

export default FormWizard;
