import { faceAttributeValue } from '@nuralogix.ai/anura-web-core-sdk';
import { FormState } from './types';

export const FORM_VALUES = {
  // Unit system options
  METRIC: 'Metric',
  IMPERIAL: 'Imperial',

  // Sex options - use SDK values as strings for form compatibility
  MALE: faceAttributeValue.SEX_ASSIGNED_MALE_AT_BIRTH.toString(),
  FEMALE: faceAttributeValue.SEX_ASSIGNED_FEMALE_AT_BIRTH.toString(),

  // Smoking options - use SDK values as strings for form compatibility
  SMOKER_TRUE: faceAttributeValue.SMOKER_TRUE.toString(),
  SMOKER_FALSE: faceAttributeValue.SMOKER_FALSE.toString(),

  // Blood pressure medication options - use SDK values as strings for form compatibility
  BLOOD_PRESSURE_MEDICATION_TRUE: faceAttributeValue.BLOOD_PRESSURE_MEDICATION_TRUE.toString(),
  BLOOD_PRESSURE_MEDICATION_FALSE: faceAttributeValue.BLOOD_PRESSURE_MEDICATION_FALSE.toString(),

  // Diabetes status options - use SDK values as strings for form compatibility
  DIABETES_TYPE1: faceAttributeValue.DIABETES_TYPE1.toString(),
  DIABETES_TYPE2: faceAttributeValue.DIABETES_TYPE2.toString(),
  DIABETES_NONE: faceAttributeValue.DIABETES_NONE.toString(),
} as const;

// Initial form state
export const INITIAL_FORM_STATE: FormState = {
  unit: FORM_VALUES.METRIC,
  heightMetric: '',
  heightFeet: '',
  heightInches: '',
  weight: '',
  age: '',
  sex: '',
  smoking: '',
  bloodPressureMed: '',
  diabetesStatus: '',
};

// Validation bounds
export const AGE_MIN = 13;
export const AGE_MAX = 120;

export const HEIGHT_METRIC_MIN = 120; // cm
export const HEIGHT_METRIC_MAX = 220; // cm

export const HEIGHT_FEET_MIN = 3;
export const HEIGHT_FEET_MAX = 7;

export const HEIGHT_INCHES_MIN = 0;
export const HEIGHT_INCHES_MAX = 11;

export const WEIGHT_METRIC_MIN = 30; // kg
export const WEIGHT_METRIC_MAX = 300; // kg

export const WEIGHT_IMPERIAL_MIN = 66; // lbs (roughly 30kg)
export const WEIGHT_IMPERIAL_MAX = 661; // lbs (roughly 300kg)

// Wizard step constants
export const WIZARD_STEPS = {
  PROFILE: 'profile',
  MEDICAL: 'medical',
} as const;
