import { useEffect, useRef } from 'react';
import {
  MeasurementOptions,
  faceTrackerState as trackingState,
} from '@nuralogix.ai/anura-web-core-sdk';
import state from '../../state';
import { useSnapshot } from 'valtio';
import { Button, Loading, Paragraph } from '@nuralogix.ai/web-ui';
import { useIsTabVisible } from '../../hooks/useIsTabVisible';
import { NotificationTypes } from '../../state/notification/types';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    marginTop: '0.5rem',
  },
  progressWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    marginTop: '0.5rem',
  },
  analyzingResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    marginTop: '0.5rem',
    gap: '0.5rem',
  },
  measurementContainer: {
    width: '60%',
    // width: '1280px',
    // height: '720px',
    // border: '1px solid #f0f0f0',
    margin: 'auto',
  },
  hiddenMedia: {
    visibility: 'hidden', // Keeps layout space but hides content
  },
});

const Measurement = () => {
  const { t } = useTranslation();
  const { ASSETS_NOT_DOWNLOADED, NOT_LOADED, READY, LOADED } = trackingState;
  const { showNotification } = useSnapshot(state.notification);
  const measurementSnap = useSnapshot(state.measurement);
  const {
    init,
    prepare,
    getVersion,
    setMediaStream,
    startTracking,
    startMeasurement,
    faceTrackerState,
    percentDownloaded,
    isMeasurementInProgress,
    isMeasurementComplete,
    isAnalyzingResults,
    warningMessage,
  } = measurementSnap;
  const { cameraStream, isOpen } = useSnapshot(state.camera);
  const mediaElementRef = useRef<HTMLDivElement | null>(null);
  const isTabVisible = useIsTabVisible();
  const isFaceTrackerLoaded = faceTrackerState === LOADED || faceTrackerState === READY;

  useEffect(() => {
    if (mediaElementRef.current) {
      init(mediaElementRef.current);
      prepare();
    }
  }, []);

  useEffect(() => {
    if (faceTrackerState === trackingState.LOADED) {
      console.log(getVersion());
    }
    if (faceTrackerState === trackingState.READY) {
      startTracking();
    }
    console.log('Face tracker state:', faceTrackerState);
  }, [faceTrackerState]);

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
      // TODO: process results here
    }
  }, [isMeasurementComplete]);

  return (
    <div {...stylex.props(styles.container)}>
      {(faceTrackerState === ASSETS_NOT_DOWNLOADED || faceTrackerState === NOT_LOADED) && (
        <div {...stylex.props(styles.progressWrapper)}>
          <ProgressBar percentage={percentDownloaded} label={t('WEB_PLEASE_WAIT')} width="60%" />
        </div>
      )}
      <div>
        {!isMeasurementComplete && (
          <div
            {...stylex.props(
              styles.measurementContainer,
              (!isFaceTrackerLoaded || isAnalyzingResults) && styles.hiddenMedia
            )}
          >
            {warningMessage && (
              <div {...stylex.props(styles.wrapper)}>
                <Paragraph>{warningMessage}</Paragraph>
              </div>
            )}
            <div ref={mediaElementRef} />
          </div>
        )}
        {isMeasurementComplete && (
          <div {...stylex.props(styles.wrapper)}>
            <Paragraph>Measurement complete.</Paragraph>
          </div>
        )}
        {isAnalyzingResults && (
          <div {...stylex.props(styles.analyzingResults)}>
            <Loading />
            <Paragraph>{t('WAITING_FOR_RESULTS')}</Paragraph>
          </div>
        )}

        {faceTrackerState === READY && !isMeasurementInProgress && (
          <div {...stylex.props(styles.wrapper)}>
            <Button onClick={start} variant="primary">
              {t('BTN_START_MEASUREMENT')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Measurement;
