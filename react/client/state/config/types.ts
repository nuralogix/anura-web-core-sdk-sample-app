export interface Config {
  checkConstraints: boolean;
  cameraFacingMode: 'user' | 'environment';
  cameraAutoStart: boolean;
  measurementAutoStart: boolean;
  cancelWhenLowSNR: boolean;
  downloadPayloads: boolean;
}

export interface ConfigState {
  config: Config;
  setConfig: (config: Config) => void;
}
