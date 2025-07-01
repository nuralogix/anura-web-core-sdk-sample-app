import React from 'react';
import state from '../../state';
import { useSnapshot } from 'valtio';
import type { DfxPointId } from '@nuralogix.ai/anura-web-core-sdk';
import './index.css';

const ViewResults = () => {
  const measurementSnap = useSnapshot(state.measurement);
  const { results } = measurementSnap;
  const finalChunkNumber = 5;
  const isFinalResultsReady = results.length === finalChunkNumber + 1;
  if (isFinalResultsReady) {
    const { points } = results[finalChunkNumber];
    const pointList = Object.keys(points) as DfxPointId[];
    return (
      <div>
        <div>Final Results</div>
          <div className="results-container">
          {pointList.map((point) => {
            const signal = points[point]!;
            const { value, info } = signal;
            const { name, unit } = info;
            return (
              <div className="results-item" key={point}>
                <div>
                  {point} - {name}
                </div>
                <div>
                  {value} {unit}
                </div>
              </div>
            );
          })}
        </div>
    </div>
    );
  } else {
    return (
      <div>
        Final results are not ready.
      </div>
    );
  }
};

export default ViewResults;