import { FormState } from './types';

// Generic numeric validation utility
const isNumericValueInvalid = (value: string, min: number, max: number): boolean => {
  if (!value) return false;
  const numValue = parseInt(value);
  return isNaN(numValue) || numValue < min || numValue > max;
};

export const isAgeInvalid = (age: string): boolean => {
  return isNumericValueInvalid(age, 13, 120);
};

export const isHeightMetricInvalid = (height: string): boolean => {
  return isNumericValueInvalid(height, 120, 220);
};

export const isHeightFeetInvalid = (feet: string): boolean => {
  return isNumericValueInvalid(feet, 3, 7);
};

export const isHeightInchesInvalid = (inches: string): boolean => {
  return isNumericValueInvalid(inches, 0, 11);
};

export const isWeightMetricInvalid = (weight: string): boolean => {
  return isNumericValueInvalid(weight, 30, 300);
};

export const isWeightImperialInvalid = (weight: string): boolean => {
  return isNumericValueInvalid(weight, 66, 661); // roughly 30kg to 300kg in lbs
};

// Composite validation functions
export const isHeightInvalid = (formState: FormState): boolean => {
  if (formState.unit === 'metric') {
    return isHeightMetricInvalid(formState.heightMetric);
  } else {
    return (
      isHeightFeetInvalid(formState.heightFeet) || isHeightInchesInvalid(formState.heightInches)
    );
  }
};

export const isWeightInvalid = (formState: FormState): boolean => {
  if (formState.unit === 'metric') {
    return isWeightMetricInvalid(formState.weight);
  } else {
    return isWeightImperialInvalid(formState.weight);
  }
};

export const isFormValid = (formState: FormState): boolean => {
  const { age, sex, smoking, bloodPressureMed, diabetesStatus } = formState;

  return (
    !isHeightInvalid(formState) &&
    !isWeightInvalid(formState) &&
    !isAgeInvalid(age) &&
    sex !== '' &&
    smoking !== '' &&
    bloodPressureMed !== '' &&
    diabetesStatus !== ''
  );
};
