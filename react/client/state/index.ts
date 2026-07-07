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
// Enable Redux DevTools Extension for Valtio — OPT-IN ONLY (REDUX_DEV_TOOLS=true), not on by
// default in development. valtio's devtools() serializes the entire state tree to the Redux
// DevTools extension on EVERY mutation; with the extension installed and browser DevTools open,
// that per-mutation cost saturates the main thread where the ONNX frame pipeline runs, starving
// detection and breaking measurements. Turn it on (REDUX_DEV_TOOLS env, e.g. in .dev.env) only
// when you specifically need time-travel debugging. REDUX_DEV_TOOLS env is injected from rollup.config.mjs.
if (process.env.REDUX_DEV_TOOLS) devtools(state, { name: 'WEB-SDK', enabled: true });
export default state;
