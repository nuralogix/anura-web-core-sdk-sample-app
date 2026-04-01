import React from 'react';
import state from '../../state';
import { useSnapshot } from 'valtio';
import type { DfxPointId } from '../../state/measurement/helpers';
import './index.css';

const BAND_COLOR_MAP: Record<string, string> = {
  YELLOW: 'rgb(255, 236, 137)',
  LIGHT_GREEN: 'rgb(145, 230, 183)',
  GREEN: 'rgb(98, 219, 153)',
  LIGHT_RED: 'rgb(255, 137, 137)',
  RED: 'rgb(255, 87, 87)',
};

const ViewResults = () => {
  const measurementSnap = useSnapshot(state.measurement);
  const { results } = measurementSnap;
  const finalChunkNumber = 5;
  const isFinalResultsReady = results.length === finalChunkNumber + 1;
  if (isFinalResultsReady) {
    const { points } = results[finalChunkNumber];
    const pointList = Object.keys(points) as DfxPointId[];

    const uniqueGroups = Array.from(
      new Set(pointList.map(p => points[p]!.meta.group))
    );

    const rows: { key: string; displayName: string; unit: string; value: string; color: string; group: string }[] = [];

    uniqueGroups.forEach(pointGroup => {
      pointList.forEach(key => {
        const point = points[key]!;
        const { meta, info, dial } = point;
        const { sections } = dial;
        const { group, resultsType } = meta;
        if (resultsType === 'INTERNAL') return;
        if (group !== pointGroup) return;
        const { name, unit } = info;
        const color = sections.length === 0
          ? 'transparent'
          : BAND_COLOR_MAP[sections[dial.group - 1]?.bandColor] ?? 'transparent';

        let value: string | number[] = point.value as string | number[];
        let displayName = name;

        const targetYear = 10;
        if (key === 'CVD_MULTI_YEAR_RISK_PROBS' && points['CVD_MULTI_YEAR_RISK_YEARS']) {
          const years = points['CVD_MULTI_YEAR_RISK_YEARS']!.value as number[];
          const index = years.indexOf(targetYear);
          value = index !== -1 ? (Number((value as number[])[index]).toFixed(2) ?? 'N/A') : 'N/A';
          displayName = `${name} (${targetYear}-year risk)`;
        }

        rows.push({ key, displayName, unit, value: String(value), color, group });
      });
    });

    return (
      <div className="results-wrapper">
        <h2 className="results-title">Final Results</h2>
        <table className="results-table">
          <thead>
            <tr>
              <th>Point</th>
              <th>Unit</th>
              <th>Value</th>
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key}>
                <td>{row.displayName}</td>
                <td>{row.unit}</td>
                <td style={{ backgroundColor: row.color }}>{row.value}</td>
                <td>{row.group}</td>
              </tr>
            ))}
          </tbody>
        </table>
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