import { devtools } from 'valtio/utils';
import { proxy } from 'valtio';
import cameraState from './camera/state';
import measurementState from './measurement/state';
import generalState from './general/state';
import configState from './config/state';
import loggerState from './logger/state';
import authState from './auth/state';

const appState = {
  general: generalState,
  camera: cameraState,
  measurement: measurementState,
  logger: loggerState,
  config: configState,
  auth: authState,
};

const state = proxy(appState);
// Enable Redux DevTools Extension for Valtio. This is only available in development mode.
// REDUX_DEV_TOOLS env is injected from rollup.config.mjs
// To use this you need to install Chrome Redux DevTool extension
if (process.env.IS_DEVELOPMENT) devtools(state, { name: 'WEB-SDK', enabled: true });
export default state;
