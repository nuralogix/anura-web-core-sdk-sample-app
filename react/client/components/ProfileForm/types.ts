export type Unit = 'metric' | 'imperial';

export type SmokingStatus = 'yes' | 'no' | '';

export type BloodPressureMedStatus = 'yes' | 'no' | '';

export type Sex = 'male' | 'female' | '';

export type DiabetesStatus = 'type1' | 'type2' | 'no' | '';

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
