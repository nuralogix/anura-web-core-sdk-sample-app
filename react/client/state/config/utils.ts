import { Config } from './types';

/**
 * Default configuration values used as fallbacks for invalid properties
 */
export const DEFAULT_CONFIG: Required<Config> = {
  checkConstraints: true,
  cameraFacingMode: 'user',
  cameraAutoStart: false,
  measurementAutoStart: false,
  cancelWhenLowSNR: true,
  downloadPayloads: false,
};

