import type { MeasurementOptions } from '@nuralogix.ai/anura-web-core-sdk';
import type { Profile } from './types';
import i18next from 'i18next';
import type { Drawables } from '@nuralogix.ai/anura-web-core-sdk';
import { type AnuraMask, constraintCodes } from '@nuralogix.ai/anura-web-core-sdk/masks/anura';
import configState from '../config/state';

/**
 * Profile validation error messages
 */
export const profileValidationMessages = {
  INVALID_PROFILE_TYPE: 'Profile must be a valid object. Received null or non-object value.',
  INVALID_AGE: 'Age must be a number between 13 and 120.',
  INVALID_HEIGHT: 'Height must be a number between 120 and 220.',
  INVALID_WEIGHT: 'Weight must be a number between 30 and 300.',
  INVALID_BMI: 'BMI must be between 10.0 and 65.0.',
  INVALID_SEX: 'Sex must be a number between 1 and 3.',
  INVALID_DIABETES: 'Diabetes must be a number between 4 and 6.',
  INVALID_BLOOD_PRESSURE_MEDICATION: 'Blood Pressure Medication must be either 0 or 1.',
  INVALID_SMOKING: 'Smoking must be either 0 or 1.',
} as const;

/**
 * Validates if a value is a valid UUID string
 */
const isValidUUID = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validates measurementOptions, specifically that userProfileId is a valid UUID if provided
 * and partnerId is a string if provided
 */
export const validateMeasurementOptions = (
  options: MeasurementOptions
): { code: string; message: string } => {
  if (options === null || typeof options !== 'object') {
    return {
      code: 'INVALID_MEASUREMENT_OPTIONS',
      message: 'measurementOptions must be an object.',
    };
  }

  if (options.partnerId !== undefined && typeof options.partnerId !== 'string') {
    return {
      code: 'INVALID_PARTNER_ID',
      message: 'partnerId must be a string.',
    };
  }

  if (options.userProfileId !== undefined && !isValidUUID(options.userProfileId)) {
    return {
      code: 'INVALID_USER_PROFILE_ID',
      message: 'userProfileId must be a valid UUID.',
    };
  }

  return { code: 'VALID', message: 'Measurement options are valid.' };
};

const isInvalidNumber = (value: unknown): boolean =>
  typeof value !== 'number' || Number.isNaN(value);

export const validateProfile = (profile: Profile): { valid: boolean; message: string } => {
  if (isInvalidNumber(profile.age) || profile.age < 13 || profile.age > 120) {
    return { valid: false, message: profileValidationMessages.INVALID_AGE };
  }

  if (isInvalidNumber(profile.heightCm) || profile.heightCm < 120 || profile.heightCm > 220) {
    return { valid: false, message: profileValidationMessages.INVALID_HEIGHT };
  }

  if (isInvalidNumber(profile.weightKg) || profile.weightKg < 30 || profile.weightKg > 300) {
    return { valid: false, message: profileValidationMessages.INVALID_WEIGHT };
  }

  const heightInMeters = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightInMeters * heightInMeters);
  if (bmi < 10.0 || bmi > 65.0) {
    return { valid: false, message: profileValidationMessages.INVALID_BMI };
  }

  if (isInvalidNumber(profile.sex) || profile.sex < 1 || profile.sex > 3) {
    return { valid: false, message: profileValidationMessages.INVALID_SEX };
  }

  if (isInvalidNumber(profile.diabetes) || profile.diabetes < 4 || profile.diabetes > 6) {
    return { valid: false, message: profileValidationMessages.INVALID_DIABETES };
  }

  if (
    isInvalidNumber(profile.bloodPressureMedication) ||
    (profile.bloodPressureMedication !== 0 && profile.bloodPressureMedication !== 1)
  ) {
    return { valid: false, message: profileValidationMessages.INVALID_BLOOD_PRESSURE_MEDICATION };
  }

  if (isInvalidNumber(profile.smoking) || (profile.smoking !== 0 && profile.smoking !== 1)) {
    return { valid: false, message: profileValidationMessages.INVALID_SMOKING };
  }

  return { valid: true, message: '' };
};

let lateChunkLowSNRCount = 0;

export const resetLowSNRCount = () => {
  lateChunkLowSNRCount = 0;
};

export const shouldCancelForLowSNR = (snrValue: number, resultsOrder: number) => {
  if (!configState.config.cancelWhenLowSNR) {
    return false;
  }

  const isLowSNR = snrValue === -100;
  const isFakeFT = snrValue === -90;
  const isFakeTOI = snrValue === -91;
  const isFake = isFakeTOI || isFakeFT;

  const measurementDuration = 30;
  const chunkDuration = 5;
  const earlyCancellationTimeThreshold = 15;
  const lateChunkLowSNRCountThreshold = 2;
  const time = (resultsOrder + 1) * chunkDuration;
  const isEarlyChunk = time <= earlyCancellationTimeThreshold;
  const isAtCancellationThreshold = time == earlyCancellationTimeThreshold;
  const isLastChunk = time === measurementDuration;
  // Count the number of low SNR chunks after 15 seconds
  if (isLowSNR && !isEarlyChunk) {
    lateChunkLowSNRCount += 1;
  }
  // Cancel if the result is fake after 15 seconds
  const shouldCancelBecauseFake = !isEarlyChunk && isFake;
  // Cancel if the result has low SNR or Fake TOI signal at exactly 15 seconds
  const shouldCancelAtCancellationThreshold = isAtCancellationThreshold && (isLowSNR || isFakeTOI);
  // Cancel if there were 2 low SNR chunks after 15 seconds
  const shouldCancelBecauseLateLowSNR = lateChunkLowSNRCount >= lateChunkLowSNRCountThreshold;
  // Cancel if the last chunk has a low SNR
  const shouldCancelBecauseFinalChunkLowSNR = isLastChunk && isLowSNR;
  // Check all cancellation conditions
  const shouldCancel =
    shouldCancelBecauseFake ||
    shouldCancelAtCancellationThreshold ||
    shouldCancelBecauseLateLowSNR ||
    shouldCancelBecauseFinalChunkLowSNR;

  if (shouldCancel) {
    lateChunkLowSNRCount = 0;
  }

  return shouldCancel;
};

// Stable value hysteresis for messages, based on consecutive frames

export type ConstraintCode =
  | (typeof constraintCodes.DISTANCE)[keyof typeof constraintCodes.DISTANCE]
  | (typeof constraintCodes.DIRECTION)[keyof typeof constraintCodes.DIRECTION]
  | (typeof constraintCodes.ROLL)[keyof typeof constraintCodes.ROLL]
  | (typeof constraintCodes.CENTER)[keyof typeof constraintCodes.CENTER]
  | (typeof constraintCodes.MOVEMENT)[keyof typeof constraintCodes.MOVEMENT];

// Compute the constraint guidance message and constraints before measurement when constraints are enabled.
// This does not draw; caller decides when/how to render.
const computePreMeasurementConstraintMessage = (drawables: Drawables, mask: AnuraMask) => {
  const constraints = mask.checkConstraints(drawables.face, drawables.annotations);
  const {
    distanceConstraint,
    directionConstraint,
    rollConstraint,
    centerConstraint,
    movementConstraint,
  } = constraints;

  let message = '';
  let code: ConstraintCode | null = null;
  if (distanceConstraint !== constraintCodes.DISTANCE.OK) {
    if (distanceConstraint === constraintCodes.DISTANCE.TOO_CLOSE) {
      message = i18next.t('MOVE_BACK');
      code = constraintCodes.DISTANCE.TOO_CLOSE;
    } else {
      message = i18next.t('MOVE_CLOSER');
      code = constraintCodes.DISTANCE.TOO_FAR;
    }
  } else if (directionConstraint !== constraintCodes.DIRECTION.OK) {
    if (directionConstraint === constraintCodes.DIRECTION.TURN_LEFT) {
      message = i18next.t('TURN_LEFT');
      code = constraintCodes.DIRECTION.TURN_LEFT;
    } else if (directionConstraint === constraintCodes.DIRECTION.TURN_RIGHT) {
      message = i18next.t('TURN_RIGHT');
      code = constraintCodes.DIRECTION.TURN_RIGHT;
    } else if (directionConstraint === constraintCodes.DIRECTION.TURN_UP) {
      message = i18next.t('LOOK_UP');
      code = constraintCodes.DIRECTION.TURN_UP;
    } else if (directionConstraint === constraintCodes.DIRECTION.TURN_DOWN) {
      message = i18next.t('LOOK_DOWN');
      code = constraintCodes.DIRECTION.TURN_DOWN;
    }
  } else if (rollConstraint !== constraintCodes.ROLL.OK) {
    if (rollConstraint === constraintCodes.ROLL.TILT_LEFT) {
      message = i18next.t('TILT_YOUR_FACE_LEFT');
      code = constraintCodes.ROLL.TILT_LEFT;
    } else {
      message = i18next.t('TILT_YOUR_FACE_RIGHT');
      code = constraintCodes.ROLL.TILT_RIGHT;
    }
  } else if (centerConstraint === constraintCodes.CENTER.NOT_CENTERED) {
    message = i18next.t('CENTER_YOUR_FACE');
    code = constraintCodes.CENTER.NOT_CENTERED;
  } else if (movementConstraint === constraintCodes.MOVEMENT.TOO_MUCH_MOVEMENT) {
    message = i18next.t('HOLD_STILL');
    code = constraintCodes.MOVEMENT.TOO_MUCH_MOVEMENT;
  }

  return { message, constraints, code } as const;
};

// Build the pre-measurement message and optional constraints based on config & face presence
export const getPreMeasurementMessageAndConstraints = (
  drawables: Drawables,
  faceDetected: boolean,
  checkConstraints: boolean,
  mask: AnuraMask
) => {
  if (!faceDetected) {
    return { message: i18next.t('FACE_NOT_DETECTED'), constraints: null, code: null } as const;
  }
  if (checkConstraints) {
    const { message, constraints, code } = computePreMeasurementConstraintMessage(drawables, mask);
    return { message, constraints, code } as const;
  }
  return { message: '', constraints: null, code: null } as const;
};

// Controller to stabilize guidance messages and avoid redundant mask.setText updates
export const createMessageController = (
  mask: AnuraMask,
  requiredFrames: number,
  onStableChange: (stableMessage: string) => void
) => {
  let lastText = '';
  let stable = '';
  let candidate = '';
  let count = 0;
  let hasEmittedInitialStable = false;

  const commit = (text: string) => {
    const next = text || '';
    if (next !== lastText) {
      mask.setText(next);
      lastText = next;
    }
    stable = next;
    onStableChange(next);
    hasEmittedInitialStable = true;
  };

  const feed = (value: string) => {
    if (value === stable) {
      candidate = value;
      count = 0;
      if (!hasEmittedInitialStable) {
        onStableChange(stable);
        hasEmittedInitialStable = true;
      }
      return;
    }
    if (value === candidate) {
      count += 1;
    } else {
      candidate = value;
      count = 1;
    }
    if (count >= requiredFrames) {
      commit(candidate);
      count = 0;
    }
  };

  const clear = () => {
    candidate = '';
    count = 0;
    if (stable !== '') {
      commit('');
    } else if (lastText !== '') {
      mask.setText('');
      lastText = '';
      onStableChange('');
      hasEmittedInitialStable = true;
    }

    if (stable === '') {
      hasEmittedInitialStable = false;
    }
  };

  return { feed, clear } as const;
};

// Helper to construct constraint overrides based on whether we enforce constraints or not
export const buildConstraintOverrides = (checkConstraints: boolean) => ({
  minimumFps: 14,
  boxWidth_pct: 100,
  boxHeight_pct: 100,
  checkBackLight: false,
  checkCameraMovement: false,
  checkCentered: false,
  checkDistance: checkConstraints,
  checkEyebrowMovement: false,
  checkFaceDirection: checkConstraints,
  checkLighting: false,
  checkMinFps: true,
  checkMovement: checkConstraints,
});
