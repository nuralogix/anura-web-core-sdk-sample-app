import state from '../../state';
import { useSnapshot } from 'valtio';
import ResultsError from './ResultsError';
import ResultsSummary from './ResultsSummary';
import { type Results, parseResults } from './helpers';
import type { DFXResults } from '@nuralogix.ai/anura-web-core-sdk';

const Results = () => {
  const measurementSnap = useSnapshot(state.measurement);
  const { results, finalChunkNumber } = measurementSnap;
  if (!results.length) {
    return <ResultsError />;
  }
  const parsedResults = parseResults(results[finalChunkNumber] as DFXResults);

  // Show error if no results OR if only SNR point exists
  const pointKeys = results ? Object.keys(parsedResults.points) : [];
  const onlySnrExists = pointKeys.length === 1 && pointKeys[0] === 'SNR';

  if (onlySnrExists) {
    return <ResultsError />;
  }

  return <ResultsSummary results={parsedResults} />;
};

export default Results;
