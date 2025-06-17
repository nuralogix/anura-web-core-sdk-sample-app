import { devtools } from 'valtio/utils';
import { proxy } from 'valtio';
import cameraState from './camera/state';
import measurementState from './measurement/state';
import notificationState from './notification/state';
import demographicsState from './demographics/state';
import generalState from './general/state';

const appState = {
  general: generalState,
  camera: cameraState,
  measurement: measurementState,
  demographics: demographicsState,
  notification: notificationState,
};

const state = proxy(appState);
// Enable Redux DevTools Extension for Valtio. This is only available in development mode.
// REDUX_DEV_TOOLS env is injected from rollup.config.mjs
// To use this you need to install Chrome Redux DevTool extension
if (process.env.IS_DEVELOPMENT) devtools(state, { name: 'WMS', enabled: true });
export default state;
