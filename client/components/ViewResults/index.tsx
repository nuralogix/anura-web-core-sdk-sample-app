import React, { useEffect, useState } from 'react';
import state from '../../state';
import { useSnapshot } from 'valtio';
import type { Results } from '@nuralogix.ai/anura-web-core-sdk';
import './index.css';

// Because Valtio makes state snapshots immutable by default. This means that
// when you extract points from the snapshot, it becomes deeply readonly, which
// conflicts with original type.
type ReadonlyPoints = ReturnType<typeof useSnapshot<Results['points']>>;

const ViewResults = () => {
  const measurementSnap = useSnapshot(state.measurement);
  const { results } = measurementSnap;
  const [intermediateResults, setIntermediateResults] = useState<ReadonlyPoints[]>([]);
  const [finalResults, setFinalResults] = useState<ReadonlyPoints>();

  useEffect(() => {
    if (results.length > 0) {
      const { points, resultsOrder, finalChunkNumber } = results[results.length - 1];
      // Intermediate results
      if (resultsOrder < finalChunkNumber) {
        setIntermediateResults((prevPoints) => [...prevPoints, points]);
      }
      // Final results
      if (resultsOrder === finalChunkNumber) {
        setFinalResults(points);
      }
    }
  }, [results]);

  const getResult = (pointList: string[], result: ReadonlyPoints) => {
    return pointList.map((point) => {
      const signal = result[point];
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
    });
  };

  return (
    <div>
      <div>Intermediate Results</div>
      {intermediateResults.map((result, index) => {
        const pointList = Object.keys(result);
        return (
          <div className="results-container" key={index}>
            {getResult(pointList, result)}
          </div>
        );
      })}
      <div>Final Results</div>
      <div className="results-container">
        {getResult(Object.keys({ ...finalResults }), { ...finalResults })}
      </div>
    </div>
  );
};

export default ViewResults;
