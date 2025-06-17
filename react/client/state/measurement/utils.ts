import { Results } from '@nuralogix.ai/anura-web-core-sdk';

export const shouldCancelForLowSNR = (results: Results) => {
  const { points, resultsOrder } = results;
  const snr = Number(points.SNR.value);

  const isLowSNR = snr === -100;
  const isFakeFT = snr === -90;
  const isFakeTOI = snr === -91;
  const isFake = isFakeTOI || isFakeFT;

  const measurementDuration = 30;
  const chunkDuration = 5;
  const earlyCancellationTimeThreshold = 15;
  const lateChunkLowSNRCountThreshold = 2;
  let lateChunkLowSNRCount = 0;
  const time = resultsOrder * chunkDuration;
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

  return shouldCancel;
};
