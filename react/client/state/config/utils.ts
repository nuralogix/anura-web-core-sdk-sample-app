import { Config } from './types';

/**
 * Default configuration values used as fallbacks for invalid properties
 */
export const DEFAULT_CONFIG: Config = {
  checkConstraints: true,
  cameraFacingMode: undefined,
  cameraAutoStart: false,
  measurementAutoStart: false,
  cancelWhenLowSNR: true,
  downloadPayloads: false,
  // Browsers don't always expose enough metadata for the app to pick the "right" 
  // camera on its own — for example, iPads expose both a standard and an ultra-wide 
  // front camera as `facingMode: 'user'`, and there's no standard way to tell them 
  // apart. `defaultCameraId` lets your application drive that choice instead.
  // Preferred camera `deviceId` to use on startup. Used only when `cameraFacingMode`
  // is not set (a set `cameraFacingMode` takes precedence). When the camera selector
  // dropdown is shown (desktop), this becomes the default selection. When the
  // dropdown is hidden (mobile, or `cameraAutoStart: true`), this camera is opened 
  // directly. If the supplied ID does not match any connected device, the browser's
  // default camera is used.
  defaultCameraId: '',
};

// `cameraFacingMode` takes precedence over `defaultCameraId`. A `defaultCameraId` 
// only counts when it is **valid** — it matches a currently connected camera; an 
// absent, empty, or disconnected ID is treated as unset.

// | `cameraFacingMode` | `defaultCameraId` valid? | Camera opened                                                                            |
// | ------------------ | ------------------------ | ---------------------------------------------------------------------------------------- |
// | set                | yes                      | selected by **facing mode** — the browser picks the device; `defaultCameraId` is ignored |
// | set                | no                       | selected by **facing mode**                                                              |
// | unset              | yes                      | the **`defaultCameraId`** device (exact match)                                           |
// | unset              | no                       | the **browser default** camera (first available)                                         |

