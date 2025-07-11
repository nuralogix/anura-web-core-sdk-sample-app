import {
  FORM_VALUES,
  AGE_MIN,
  AGE_MAX,
  HEIGHT_METRIC_MIN,
  HEIGHT_METRIC_MAX,
  HEIGHT_FEET_MIN,
  HEIGHT_FEET_MAX,
  HEIGHT_INCHES_MIN,
  HEIGHT_INCHES_MAX,
  WEIGHT_METRIC_MIN,
  WEIGHT_METRIC_MAX,
  WEIGHT_IMPERIAL_MIN,
  WEIGHT_IMPERIAL_MAX,
  BMI_MIN,
  BMI_MAX,
} from './constants';
import { FormState } from './types';

// Utility to create a blur handler that strips spaces and sets touched state
export const createFieldBlurHandler = (
  value: string,
  onChange: (value: string) => void,
  setTouched: (touched: boolean) => void
) => {
  return () => {
    setTouched(true);
    // Strip spaces from the value
    const trimmedValue = value.replace(/\s/g, '');
    if (trimmedValue !== value) {
      onChange(trimmedValue);
    }
  };
};

// Generic numeric validation utility
const isNumericValueInvalid = (value: string, min: number, max: number): boolean => {
  // Strip spaces before validation to avoid showing errors for spaces
  const cleanValue = value.replace(/\s/g, '');
  if (!cleanValue) return true;
  const numValue = parseInt(cleanValue);
  return isNaN(numValue) || cleanValue !== numValue.toString() || numValue < min || numValue > max;
};

export const isAgeInvalid = (age: string): boolean => {
  return isNumericValueInvalid(age, AGE_MIN, AGE_MAX);
};

export const isHeightMetricInvalid = (height: string): boolean => {
  return isNumericValueInvalid(height, HEIGHT_METRIC_MIN, HEIGHT_METRIC_MAX);
};

export const isHeightFeetInvalid = (feet: string): boolean => {
  return isNumericValueInvalid(feet, HEIGHT_FEET_MIN, HEIGHT_FEET_MAX);
};

export const isHeightInchesInvalid = (inches: string): boolean => {
  return isNumericValueInvalid(inches, HEIGHT_INCHES_MIN, HEIGHT_INCHES_MAX);
};

export const isWeightMetricInvalid = (weight: string): boolean => {
  return isNumericValueInvalid(weight, WEIGHT_METRIC_MIN, WEIGHT_METRIC_MAX);
};

export const isWeightImperialInvalid = (weight: string): boolean => {
  return isNumericValueInvalid(weight, WEIGHT_IMPERIAL_MIN, WEIGHT_IMPERIAL_MAX);
};

export const isHeightInvalid = (formState: FormState): boolean => {
  if (formState.unit === FORM_VALUES.METRIC) {
    return isHeightMetricInvalid(formState.heightMetric);
  } else {
    return (
      isHeightFeetInvalid(formState.heightFeet) || isHeightInchesInvalid(formState.heightInches)
    );
  }
};

export const isWeightInvalid = (formState: FormState): boolean => {
  if (formState.unit === FORM_VALUES.METRIC) {
    return isWeightMetricInvalid(formState.weight);
  } else {
    return isWeightImperialInvalid(formState.weight);
  }
};

// BMI calculation utility
const calculateBMI = (formState: FormState): number | null => {
  // Only calculate BMI if both height and weight are valid
  if (isHeightInvalid(formState) || isWeightInvalid(formState)) {
    return null;
  }

  let heightInCm: number;
  let weightInKg: number;

  if (formState.unit === FORM_VALUES.METRIC) {
    heightInCm = parseInt(formState.heightMetric.replace(/\s/g, ''));
    weightInKg = parseInt(formState.weight.replace(/\s/g, ''));
  } else {
    // Convert imperial to metric
    const feet = parseInt(formState.heightFeet.replace(/\s/g, ''));
    const inches = parseInt(formState.heightInches.replace(/\s/g, ''));
    const totalInches = feet * 12 + inches;
    heightInCm = totalInches * 2.54;

    const weightInLbs = parseInt(formState.weight.replace(/\s/g, ''));
    weightInKg = weightInLbs * 0.453592;
  }

  const heightInM = heightInCm / 100;
  return weightInKg / (heightInM * heightInM);
};

// BMI validation utility
export const isBMIInvalid = (formState: FormState): boolean => {
  const bmi = calculateBMI(formState);
  if (bmi === null) {
    return false; // Don't show BMI error if height/weight are invalid
  }
  return bmi < BMI_MIN || bmi > BMI_MAX;
};

// Utility to get BMI value for display purposes
export const getBMI = (formState: FormState): number | null => {
  return calculateBMI(formState);
};

// Utility to format BMI for display
export const formatBMI = (formState: FormState): string | null => {
  const bmi = calculateBMI(formState);
  if (bmi === null) return null;
  return bmi.toFixed(1);
};

// Step-specific validation functions
export const isProfileInfoValid = (formState: FormState): boolean => {
  const { age, sex } = formState;

  return (
    !isHeightInvalid(formState) &&
    !isWeightInvalid(formState) &&
    !isBMIInvalid(formState) &&
    !isAgeInvalid(age) &&
    sex !== ''
  );
};

export const isMedicalQuestionnaireValid = (formState: FormState): boolean => {
  const { smoking, bloodPressureMed, diabetesStatus } = formState;

  return smoking !== '' && bloodPressureMed !== '' && diabetesStatus !== '';
};

export const isFormValid = (formState: FormState): boolean => {
  return isProfileInfoValid(formState) && isMedicalQuestionnaireValid(formState);
};
