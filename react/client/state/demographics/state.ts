import { proxy } from 'valtio';
import { faceAttributeValue } from '@nuralogix.ai/anura-web-core-sdk';
import { DemographicsState } from './types';
import loggerState from '../logger/state';

const demographicsState: DemographicsState = proxy({
  demographics: {
    age: 40,
    height: 180,
    weight: 60,
    sex: faceAttributeValue.SEX_ASSIGNED_MALE_AT_BIRTH,
    smoking: faceAttributeValue.SMOKER_FALSE,
    bloodPressureMedication: faceAttributeValue.BLOOD_PRESSURE_MEDICATION_FALSE,
    diabetes: faceAttributeValue.DIABETES_NONE,
    unit: 'Metric',
  },
  setDemographics: (demographics) => {
    demographicsState.demographics = demographics;
  },
});

export default demographicsState;
