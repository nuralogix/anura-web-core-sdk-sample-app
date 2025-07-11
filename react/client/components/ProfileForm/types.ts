import { FORM_VALUES, WIZARD_STEPS } from './constants';

export type Unit = typeof FORM_VALUES.METRIC | typeof FORM_VALUES.IMPERIAL;

export type SmokingStatus = typeof FORM_VALUES.YES | typeof FORM_VALUES.NO | '';

export type BloodPressureMedStatus = typeof FORM_VALUES.YES | typeof FORM_VALUES.NO | '';

export type Sex = typeof FORM_VALUES.MALE | typeof FORM_VALUES.FEMALE | '';

export type DiabetesStatus =
  | typeof FORM_VALUES.DIABETES_TYPE1
  | typeof FORM_VALUES.DIABETES_TYPE2
  | typeof FORM_VALUES.DIABETES_NO
  | '';

export type WizardStep = typeof WIZARD_STEPS.PROFILE | typeof WIZARD_STEPS.MEDICAL;

export interface FormState {
  unit: Unit;
  heightMetric: string;
  heightFeet: string; // For imperial only
  heightInches: string; // For imperial only
  weight: string;
  age: string;
  sex: Sex;
  smoking: SmokingStatus;
  bloodPressureMed: BloodPressureMedStatus;
  diabetesStatus: DiabetesStatus;
}
