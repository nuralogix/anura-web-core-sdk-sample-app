import React, { useState } from 'react';
import { TextInput, RadioButtonGroup } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import FormField from './FormField';
import HeightInput from './HeightInput';
import { FormState } from './types';

interface ProfileInfoProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ formState, setFormState }) => {
  const { t } = useTranslation();
  const [ageTouched, setAgeTouched] = useState(false);
  const [weightTouched, setWeightTouched] = useState(false);

  const unitOptions = [
    { value: 'metric', label: t('METRIC') },
    { value: 'imperial', label: t('IMPERIAL') },
  ];

  const sexOptions = [
    { value: 'male', label: t('MALE') },
    { value: 'female', label: t('FEMALE') },
  ];

  const isMetric = formState.unit === 'metric';

  const isWeightInvalid = () => {
    if (!formState.weight) return false;
    const weightNum = parseInt(formState.weight);
    if (isMetric) {
      return isNaN(weightNum) || weightNum < 30 || weightNum > 300;
    } else {
      return isNaN(weightNum) || weightNum < 66 || weightNum > 661; // roughly 30kg to 300kg in lbs
    }
  };

  const isAgeInvalid = () => {
    if (!formState.age) return false;
    const ageNum = parseInt(formState.age);
    return isNaN(ageNum) || ageNum < 13 || ageNum > 120;
  };

  const handleUnitChange = (value: string) => {
    setFormState((prev) => ({ ...prev, unit: value }));
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, heightMetric: e.target.value }));
  };

  const handleHeightFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, heightFeet: e.target.value }));
  };

  const handleHeightInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, heightInches: e.target.value }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, weight: e.target.value }));
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, age: e.target.value }));
  };

  const handleAgeBlur = () => {
    setAgeTouched(true);
  };

  const handleWeightBlur = () => {
    setWeightTouched(true);
  };

  const handleSexChange = (value: string) => {
    setFormState((prev) => ({ ...prev, sex: value }));
  };

  return (
    <>
      <FormField>
        <TextInput
          label={t('PROFILE_FORM_AGE_LABEL')}
          value={formState.age}
          onChange={handleAgeChange}
          placeholder={t('PROFILE_FORM_AGE_PLACEHOLDER')}
          invalid={ageTouched && isAgeInvalid()}
          invalidMessage={t('PROFILE_FORM_VALIDATION_AGE')}
          onBlur={handleAgeBlur}
        />
      </FormField>

      <FormField>
        <RadioButtonGroup
          direction="row"
          label={t('PROFILE_FORM_UNIT_LABEL')}
          value={formState.unit}
          onChange={handleUnitChange}
          options={unitOptions}
        />
      </FormField>

      <FormField layout="row">
        <HeightInput
          heightMetric={formState.heightMetric}
          heightFeet={formState.heightFeet}
          heightInches={formState.heightInches}
          onMetricHeightChange={handleHeightChange}
          onFeetChange={handleHeightFeetChange}
          onInchesChange={handleHeightInchesChange}
          isMetric={isMetric}
        />
        <TextInput
          label={t(
            isMetric ? 'PROFILE_FORM_WEIGHT_LABEL_METRIC' : 'PROFILE_FORM_WEIGHT_LABEL_IMPERIAL'
          )}
          value={formState.weight}
          onChange={handleWeightChange}
          placeholder={t(
            isMetric
              ? 'PROFILE_FORM_WEIGHT_PLACEHOLDER_METRIC'
              : 'PROFILE_FORM_WEIGHT_PLACEHOLDER_IMPERIAL'
          )}
          invalid={weightTouched && isWeightInvalid()}
          invalidMessage={t(
            isMetric
              ? 'PROFILE_FORM_VALIDATION_WEIGHT_METRIC'
              : 'PROFILE_FORM_VALIDATION_WEIGHT_IMPERIAL'
          )}
          onBlur={handleWeightBlur}
        />
      </FormField>

      <FormField>
        <RadioButtonGroup
          direction="row"
          label={t('PROFILE_FORM_SEX_LABEL')}
          value={formState.sex}
          onChange={handleSexChange}
          options={sexOptions}
        />
      </FormField>
    </>
  );
};

export default ProfileInfo;
