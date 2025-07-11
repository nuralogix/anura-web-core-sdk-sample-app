import React, { useState, useEffect } from 'react';
import { Heading, Button, Card, Paragraph } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import ProfileInfo from './ProfileInfo';
import MedicalQuestionnaire from './MedicalQuestionnaire';
import { FormState } from './types';
import { isProfileInfoValid, isMedicalQuestionnaireValid } from './validationUtils';
import { INITIAL_FORM_STATE } from './constants';

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

type WizardStep = 'profile' | 'medical';

const FormWizard = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('profile');
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

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
    if (currentStep === 'profile' && isProfileInfoValid(formState)) {
      setCurrentStep('medical');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'medical') {
      setCurrentStep('profile');
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted with data:', formState);
    // Add logic for final submission
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'profile':
        return <ProfileInfo formState={formState} setFormState={setFormState} />;
      case 'medical':
        return <MedicalQuestionnaire formState={formState} setFormState={setFormState} />;
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (currentStep === 'profile') {
      return (
        <div {...stylex.props(styles.singleButton)}>
          <Button onClick={handleNextStep} disabled={!isProfileInfoValid(formState)}>
            Next
          </Button>
        </div>
      );
    }

    if (currentStep === 'medical') {
      return (
        <div {...stylex.props(styles.buttonWrapper)}>
          <Button variant="outline" onClick={handlePreviousStep}>
            Previous
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
      case 'profile':
        return 'Basic Information';
      case 'medical':
        return 'Health Questions';
      default:
        return t('PROFILE_FORM_TITLE') as string;
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
