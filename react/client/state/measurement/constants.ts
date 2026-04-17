import type { AnuraMaskSettings } from '@nuralogix.ai/anura-web-core-sdk/masks/anura';

// How many consecutive frames are required before committing a message change
export const MESSAGE_REQUIRED_FRAMES = 5; // frames needed to update mask text

export const NO_FACE_FRAME_THRESHOLD = 10;

// Default mask visual settings
export const ANURA_MASK_SETTINGS: AnuraMaskSettings = {
  starFillColor: '#39cb3a',
  starBorderColor: '#d1d1d1',
  pulseRateColor: 'red',
  pulseRateLabelColor: '#ffffff',
  backgroundColor: '#ffffff',
  countDownLabelColor: '#000000',
  faceNotCenteredColor: '#fc6a0f',
  /** must be > 0 and <= 1 */
  diameter: 0.8,
  /** must be > 0 and <= 1 */
  topMargin: 0.06,
  /** must be > 0 and <= 1 */
  bottomMargin: 0.02,
  shouldFlipHorizontally: true,
};
