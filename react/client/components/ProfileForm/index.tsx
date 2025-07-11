import React, { useState, useEffect } from 'react';
import { Heading, Button, Card, Paragraph } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import ProfileInfo from './ProfileInfo';
import MedicalQuestionnaire from './MedicalQuestionnaire';
import { FormState } from './types';
import { isFormValid } from './validationUtils';
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
  fieldWrapper: {
    marginBottom: '24px',
  },
  submitWrapper: {
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

const ProfileForm = () => {
  const { t } = useTranslation();

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('Form submitted with data:', formState);

    // You could add additional logic here like:
    // - API calls to submit data
    // - Show success message
    // - Reset form
    // - Navigate to next page
  };

  return (
    <div {...stylex.props(styles.wrapper)}>
      <Card xstyle={styles.card}>
        <Heading>{t('PROFILE_FORM_TITLE')}</Heading>
        <div {...stylex.props(styles.introMessage)}>
          <Paragraph>{t('PROFILE_FORM_INTRO_MESSAGE')}</Paragraph>
        </div>
        <form onSubmit={handleSubmit}>
          <ProfileInfo formState={formState} setFormState={setFormState} />
          <MedicalQuestionnaire formState={formState} setFormState={setFormState} />
          <div {...stylex.props(styles.submitWrapper)}>
            <Button type="submit" disabled={!isFormValid(formState)}>
              {t('PROFILE_FORM_SUBMIT_BUTTON')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileForm;
