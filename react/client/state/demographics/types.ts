import { type Demographics } from '@nuralogix.ai/anura-web-core-sdk';

export interface DemographicsState {
  demographics: Demographics;
  setDemographics: (demographics: Demographics) => void;
}
