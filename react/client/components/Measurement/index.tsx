import { useEffect, useRef } from 'react';
import { faceTrackerState as trackingState } from '@nuralogix.ai/anura-web-core-sdk';
import state from '../../state';
import { useSnapshot } from 'valtio';
import useMeasurement from '../../hooks/useMeasurement';
import useMeasurementPhase from '../../hooks/useMeasurementPhase';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import MeasurementFooter from './MeasurementFooter';
import ResettingOverlay from './ResettingOverlay';
import AnalyzingOverlay from './AnalyzingOverlay';
import TrackerSpinner from './TrackerSpinner';

const styles = stylex.create({
  container: {
    marginTop: '0.5rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  progressWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
  measurementContainer: {
    backgroundColor: 'white',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    containerType: 'size',
    boxSizing: 'border-box',
    position: 'relative',
  },
  mediaElement: {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    '@container (min-aspect-ratio: 1 / 1)': {
      maxWidth: 'calc(100cqh * 16 / 9)',
    },
    '@container (max-aspect-ratio: 1 / 1)': {
      maxWidth: 'none',
    },
  },
  hiddenMedia: {
    visibility: 'hidden',
  },
  hiddenFooter: {
    visibility: 'hidden',
  },
});

const Measurement = () => {
  const { t } = useTranslation();
  const { ASSETS_NOT_DOWNLOADED, NOT_LOADED, LOADING } = trackingState;
  const { config } = useSnapshot(state.config);
  const measurementSnap = useSnapshot(state.measurement);
  useMeasurement(); // All measurement side effects
  const cameraSnap = useSnapshot(state.camera);
  const { faceTrackerState, isFaceTrackerLoaded, percentDownloaded, token } = measurementSnap;
  const { isInProgress, isComplete, isAnalyzing, isResetting, isIdle } = useMeasurementPhase();
  const { isOpen, deviceId } = cameraSnap;
  const mediaElementRef = useRef<HTMLDivElement | null>(null);

  const showProgressBar =
    isIdle && (faceTrackerState === ASSETS_NOT_DOWNLOADED || faceTrackerState === NOT_LOADED);
  const showTrackerSpinner = !isAnalyzing && faceTrackerState === LOADING;
  const showMeasurementSurface = !isComplete || isAnalyzing;

  // Footer visibility checks
  const showFooter =
    isFaceTrackerLoaded &&
    !isAnalyzing &&
    !isInProgress &&
    // Don't show if cameraAutoStart is enabled and camera is not open
    !(config.cameraAutoStart && !isOpen) &&
    // Don't show if measurementAutoStart is enabled and camera is open
    !(config.measurementAutoStart && isOpen);

  useEffect(() => {
    const initMeasurement = async () => {
      if (token && mediaElementRef.current) {
        await state.measurement.init(mediaElementRef.current);
      }
    };
    initMeasurement();
  }, [token]);

  return (
    <div {...stylex.props(styles.container)}>
      {showProgressBar && (
        <div {...stylex.props(styles.progressWrapper)}>
          <ProgressBar percentage={percentDownloaded} label={t('PLEASE_WAIT')} width="60%" />
        </div>
      )}
      {showTrackerSpinner && <TrackerSpinner />}
      {showMeasurementSurface && (
        <div
          {...stylex.props(styles.measurementContainer, !isFaceTrackerLoaded && styles.hiddenMedia)}
        >
          <div
            {...stylex.props(styles.mediaElement, isAnalyzing && styles.hiddenMedia)}
            ref={mediaElementRef}
          />
          {isResetting && <ResettingOverlay />}
          {isAnalyzing && <AnalyzingOverlay />}
        </div>
      )}
      {isFaceTrackerLoaded && (
        <div {...stylex.props(!showFooter && styles.hiddenFooter)}>
          <MeasurementFooter deviceId={deviceId} />
        </div>
      )}
    </div>
  );
};

export default Measurement;
