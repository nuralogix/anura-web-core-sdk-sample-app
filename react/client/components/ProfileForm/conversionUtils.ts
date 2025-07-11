import { Demographics } from '@nuralogix.ai/anura-web-core-sdk';
import { FormState } from './types';
import { FORM_VALUES } from './constants';

/**
 * Converts form state to SDK Demographics format
 * Form values are already aligned with SDK values, only need string-to-number conversion
 * Height and weight are always converted to metric (cm and kg)
 */
export const convertFormStateToSDKDemographics = (formState: FormState): Demographics => {
  const {
    age,
    weight,
    sex,
    smoking,
    bloodPressureMed,
    diabetesStatus,
    unit,
    heightMetric,
    heightFeet,
    heightInches,
  } = formState;

  const heightInCm =
    unit === FORM_VALUES.METRIC
      ? parseInt(heightMetric) // Already in cm
      : Math.round((parseInt(heightFeet) * 12 + parseInt(heightInches)) * 2.54); // Convert feet + inches to cm

  const weightInKg =
    unit === FORM_VALUES.METRIC
      ? parseInt(weight) // Already in kg
      : Math.round(parseInt(weight) * 0.453592); // Convert pounds to kg

  return {
    age: parseInt(age),
    height: heightInCm,
    weight: weightInKg,
    sex: parseInt(sex), // Form value is already SDK value as string
    smoking: parseInt(smoking), // Form value is already SDK value as string
    bloodPressureMedication: parseInt(bloodPressureMed), // Form value is already SDK value as string
    diabetes: parseInt(diabetesStatus), // Form value is already SDK value as string
    unit: 'Metric', // TODO remove when sdk updated
  };
};
