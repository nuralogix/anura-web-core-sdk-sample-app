import { FormState } from './types';

export const FORM_VALUES = {
  // Yes/No options for radio buttons
  YES: 'yes',
  NO: 'no',

  // Unit system options
  METRIC: 'metric',
  IMPERIAL: 'imperial',

  // Sex options
  MALE: 'male',
  FEMALE: 'female',

  // Diabetes status options
  DIABETES_TYPE1: 'type1',
  DIABETES_TYPE2: 'type2',
  DIABETES_NO: 'no',
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
