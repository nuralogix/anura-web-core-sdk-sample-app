export interface FormState {
  unit: 'metric' | 'imperial';
  heightMetric: string;
  heightFeet: string; // For imperial only
  heightInches: string; // For imperial only
  weight: string;
  age: string;
  sex: string;
  smoking: string;
  bloodPressureMed: string;
  diabetesStatus: string;
}
