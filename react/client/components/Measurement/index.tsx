import { useEffect, useRef } from 'react';
import {
  MeasurementOptions,
  faceTrackerState as trackingState,
} from '@nuralogix.ai/anura-web-core-sdk';
import { useNavigate } from 'react-router';
import state from '../../state';
import { useSnapshot } from 'valtio';
import { Button, Loading, Paragraph } from '@nuralogix.ai/web-ui';
import { useIsTabVisible } from '../../hooks/useIsTabVisible';
import { NotificationTypes } from '../../state/notification/types';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import CameraToggle from '../CameraToggle';

const styles = stylex.create({
  container: {
    marginTop: '0.5rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  progressWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
  wrapper: {
    display: 'flex',
    margin: '0.5rem auto',
  },
  warningMessage: {
    display: 'flex',
    marginInline: 'auto',
    minHeight: '3rem',
  },
  footer: {
    display: 'flex',
    marginInline: 'auto',
    padding: '0.5rem',
  },
  analyzingResults: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    marginTop: '0.5rem',
    gap: '0.5rem',
  },
  measurementContainer: {
    backgroundColor: 'white',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    containerType: 'size',
    boxSizing: 'border-box',
  },
  mediaElement: {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    /* LANDSCAPE: enforce 16:9 aspect ratio */
    '@container (min-aspect-ratio: 1 / 1)': {
      /* 100% wide unless that results in a width wider than 16:9 */
      /* Clamp the width so it doesn't exceed container's height × (16 / 9)*/      
      maxWidth: 'calc(100cqh * 16 / 9)',
    },
    /* PORTRAIT: allow full width — no max-width clamp */
    '@container (max-aspect-ratio: 1 / 1)': {
      maxWidth: 'none',
    },
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
  hiddenMedia: {
    visibility: 'hidden', // Keeps layout space but hides content
  },
});

const Measurement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ASSETS_NOT_DOWNLOADED, NOT_LOADED, READY, LOADING, LOADED } = trackingState;
  const { showNotification } = useSnapshot(state.notification);
  const measurementSnap = useSnapshot(state.measurement);
  const demographicsSnap = useSnapshot(state.demographics);
  const { age } = demographicsSnap.demographics;
  const {
    init,
    prepare,
    setMediaStream,
    startMeasurement,
    faceTrackerState,
    percentDownloaded,
    isMeasurementInProgress,
    isMeasurementComplete,
    isAnalyzingResults,
    warningMessage,
    destroy,
  } = measurementSnap;
  const { cameraStream, isOpen, deviceId } = useSnapshot(state.camera);
  const mediaElementRef = useRef<HTMLDivElement | null>(null);
  const isTabVisible = useIsTabVisible();
  const isFaceTrackerLoaded = faceTrackerState === LOADED || faceTrackerState === READY;

  useEffect(() => {
    if (mediaElementRef.current) {
      init(mediaElementRef.current);
      prepare();
    }
    const destroyMeasurement = async () => {
      await destroy();
    }
    return () => {
      destroyMeasurement();
    }
  }, []);

  useEffect(() => {
    if (isOpen && cameraStream) {
      setMediaStream(cameraStream);
    }
  }, [isOpen, cameraStream]);

  useEffect(() => {
    if (!isTabVisible && isMeasurementInProgress) {
      showNotification(NotificationTypes.Error, t('ERROR_TAB_SWITCHED_OR_WINDOW_MINIMIZED'));
    }
  }, [isTabVisible]);

  useEffect(() => {
    // Navigate to profile if demographics are not set
    if (age === 0) {
       navigate('/');
    }
  }, [age]);

  const start = async () => {
    // You can optionally pass measurement options to the startMeasurement method
    // Both userProfileId and partnerId are optional
    const measurementOptions: MeasurementOptions = {
      userProfileId: 'userProfileId',
      partnerId: 'partnerId',
    };
    await startMeasurement();
  };

  useEffect(() => {
    if (isMeasurementComplete) {
      navigate('/results');
    }
  }, [isMeasurementComplete]);

  return (
    <div {...stylex.props(styles.container)}>
      {/* Download assets' progress bar */}
      {(faceTrackerState === ASSETS_NOT_DOWNLOADED || faceTrackerState === NOT_LOADED) && (
        <div {...stylex.props(styles.progressWrapper)}>
          <ProgressBar percentage={percentDownloaded} label={t('WEB_PLEASE_WAIT')} width="60%" />
        </div>
      )}

      {/* Face tracker loading spinner */}
      {faceTrackerState === LOADING && (
        <div {...stylex.props(styles.spinner)}>
          <Loading />
        </div>
      )}

      {/* Waiting for results spinner */}
      {isAnalyzingResults && (
        <div {...stylex.props(styles.analyzingResults)}>
          <Loading />
          <Paragraph>{t('WAITING_FOR_RESULTS')}</Paragraph>
        </div>
      )}

      {/* Container for displaying warning messages */}
      <div {...stylex.props(styles.warningMessage)}>
        {!isAnalyzingResults && warningMessage && (<Paragraph>{warningMessage}</Paragraph>)}
      </div>

      {/* Container for the camera stream and the mask */}
      {!isMeasurementComplete && (
        <div
          {...stylex.props(
            styles.measurementContainer,
            !isFaceTrackerLoaded && styles.hiddenMedia
          )}
        >
          <div {...stylex.props(styles.mediaElement)} ref={mediaElementRef} />
        </div>
      )}

      {/* Container for toggle camera and start measurement buttons */}
      <div {...stylex.props(styles.footer)}>
        {isFaceTrackerLoaded && deviceId && <CameraToggle />}
        {faceTrackerState === READY && !isMeasurementInProgress && (
          <Button onClick={start} variant="primary">
            {t('BTN_START_MEASUREMENT')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Measurement;