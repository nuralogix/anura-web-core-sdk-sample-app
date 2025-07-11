import React from 'react';
import { Button, Paragraph } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import {
  MetricHeightField,
  ImperialHeightField,
  AgeField,
  UnitSelector,
  WeightField,
  SexSelector,
} from './Fields';
import { FormState, Unit, Sex } from './types';
import { FORM_VALUES } from './constants';
import { isProfileInfoValid, isBMIInvalid } from './validationUtils';

const styles = stylex.create({
  nextButton: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'center',
  },
});

interface ProfileInfoProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onNext: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ formState, setFormState, onNext }) => {
  const { t } = useTranslation();
  const isMetric = formState.unit === FORM_VALUES.METRIC;

  const handleAgeChange = (value: string) => {
    setFormState((prev) => ({ ...prev, age: value }));
  };

  const handleUnitChange = (value: Unit) => {
    setFormState((prev) => ({ ...prev, unit: value }));
  };

  const handleHeightMetricChange = (value: string) => {
    setFormState((prev) => ({ ...prev, heightMetric: value }));
  };

  const handleHeightFeetChange = (value: string) => {
    setFormState((prev) => ({ ...prev, heightFeet: value }));
  };

  const handleHeightInchesChange = (value: string) => {
    setFormState((prev) => ({ ...prev, heightInches: value }));
  };

  const handleWeightChange = (value: string) => {
    setFormState((prev) => ({ ...prev, weight: value }));
  };

  const handleSexSelection = (value: Sex) => {
    setFormState((prev) => ({ ...prev, sex: value }));
  };

  return (
    <>
      <SexSelector value={formState.sex} onChange={handleSexSelection} />
      <AgeField value={formState.age} onChange={handleAgeChange} />
      <UnitSelector value={formState.unit} onChange={handleUnitChange} />
      {isBMIInvalid(formState) && <Paragraph>{t('PROFILE_FORM_VALIDATION_BMI')}</Paragraph>}
      {isMetric ? (
        <MetricHeightField value={formState.heightMetric} onChange={handleHeightMetricChange} />
      ) : (
        <ImperialHeightField
          feet={formState.heightFeet}
          inches={formState.heightInches}
          onFeetChange={handleHeightFeetChange}
          onInchesChange={handleHeightInchesChange}
        />
      )}
      <WeightField value={formState.weight} onChange={handleWeightChange} isMetric={isMetric} />
      <div {...stylex.props(styles.nextButton)}>
        <Button width="100%" onClick={onNext} disabled={!isProfileInfoValid(formState)}>
          {t('NEXT')}
        </Button>
      </div>
    </>
  );
};

export default ProfileInfo;
