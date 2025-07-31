import { proxy } from 'valtio';
import { faceAttributeValue } from '@nuralogix.ai/anura-web-core-sdk';
import { DemographicsState } from './types';

const demographicsState: DemographicsState = proxy({
  demographics: {
    age: 0,
    height: 0,
    weight: 0,
    sex: faceAttributeValue.SEX_ASSIGNED_MALE_AT_BIRTH,
    smoking: faceAttributeValue.SMOKER_FALSE,
    bloodPressureMedication: faceAttributeValue.BLOOD_PRESSURE_MEDICATION_FALSE,
    diabetes: faceAttributeValue.DIABETES_NONE,
  },
  setDemographics: (demographics) => {
    demographicsState.demographics = demographics;
  },
});

export default demographicsState;
