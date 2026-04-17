import { proxy } from 'valtio';
import { ConfigState } from './types';
import { DEFAULT_CONFIG } from './utils';
import { logCategory, logMessages } from '../logger/types';
import loggerState from '../logger/state';

const configState: ConfigState = proxy({
  config: DEFAULT_CONFIG,
  setConfig: (config) => {
    configState.config = config;
    loggerState.addLog(logMessages.APP_CONFIG_IS_SET, logCategory.app, {
      config,
    });
  },
});

export default configState;
