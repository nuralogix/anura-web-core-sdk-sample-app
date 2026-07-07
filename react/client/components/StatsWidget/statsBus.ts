import type { Drawables } from '@nuralogix.ai/anura-web-core-sdk';

/** The per-frame pipeline stats the SDK emits on `drawables.stats`. */
export type PipelineStats = Drawables['stats'];

type StatsListener = (stats: PipelineStats) => void;

let listener: StatsListener | null = null;

/**
 * Bridge between the (per-frame) measurement handler and the StatsWidget.
 *
 * Stats arrive on every `facialLandmarksUpdated` frame; routing them through React
 * state would trigger a re-render per frame and load the main thread (which the
 * on-main-thread ONNX pipeline shares). So the widget subscribes with an imperative
 * DOM-updating callback instead, and this bus just forwards the latest stats to it.
 * Only one widget exists at a time, so a single listener slot is enough.
 */
export const statsBus = {
  push(stats: PipelineStats): void {
    listener?.(stats);
  },
  subscribe(fn: StatsListener): () => void {
    listener = fn;
    return () => {
      if (listener === fn) listener = null;
    };
  },
};
