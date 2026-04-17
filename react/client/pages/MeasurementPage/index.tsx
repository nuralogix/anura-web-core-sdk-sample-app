import CameraDevices from '../../components/CameraDevices';
import Measurement from '../../components/Measurement';
import CloseButton from '../../components/CloseButton';
import { useSnapshot, snapshot } from 'valtio';
import state from '../../state';
import useMeasurementPhase from '../../hooks/useMeasurementPhase';
import * as stylex from '@stylexjs/stylex';
import { useEffect } from 'react';
import { MeasurementPhase } from '../../state/measurement/types';
import { useNavigate } from 'react-router';
import { isCancelOnErrorCode } from '../Measurement/constants';
import { Container } from '@nuralogix.ai/web-ui';
import MeasurementHeader from '../../components/MeasurementHeader';
import ErrorMessage from '../Measurement/ErrorMessage';
import { logCategory, logMessages } from '../../state/logger/types';

const styles = stylex.create({
  wrapper: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0.75rem',
    minHeight: '3rem',
    position: 'relative',
  },
  closeButtonWrapper: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  pageWrapper: {
    height: '100%',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});

const getAppSettings = async () => {
  const apiUrl = '/api';
  const studyId = await fetch(`${apiUrl}/studyId`);
  const studyIdResponse = await studyId.json();
  const token = await fetch(`${apiUrl}/token`);
  const tokenResponse = await token.json();

  return { studyIdResponse, tokenResponse };
};

const MeasurementPage = () => {
  const navigate = useNavigate();
  const measurementSnap = useSnapshot(state.measurement);
  const generalSnap = useSnapshot(state.general);
  const { errorCode } = generalSnap;
  const { isFaceTrackerLoaded, measurementPhase, token } = measurementSnap;
  const { isIdle: isPreMeasurement, isInProgress } = useMeasurementPhase();

  const cameraSnap = useSnapshot(state.camera);
  const { isPermissionGranted, isOpen } = cameraSnap;

  const showCloseButton = (isFaceTrackerLoaded && isOpen) || isInProgress;
  const showCameraDevices = isFaceTrackerLoaded && isPreMeasurement && isPermissionGranted;

  useEffect(() => {
    // App loaded event is the first event to be sent
    state.logger.addLog(logMessages.APP_LOADED, logCategory.app);
    const getTokens = async () => {
        const { studyIdResponse, tokenResponse } = await getAppSettings();
        state.measurement.setAppSettings(
            tokenResponse.token,
            tokenResponse.refreshToken,
            studyIdResponse.studyId,
        );
        await state.camera.requestPermission();
    }
    getTokens();

    return () => {
      const cleanup = async () => {
        const logs = snapshot(state.logger.getLogs());
        state.logger.clearLogs();
        console.log('SDK Logs:', logs);
        // Destroy the workers and free up resources
        state.camera.stop();
        state.measurement.setMaskVisibility(false);
        const destroyed = await state.measurement.destroy();
      };
      cleanup();
    };
  }, []);  

  useEffect(() => {
    if (measurementPhase === MeasurementPhase.Complete) {
      navigate('/results');
    }
  }, [measurementPhase]);

  useEffect(() => {
    if (errorCode) {
      if (isCancelOnErrorCode(errorCode)) {
        const cancelMeaurement = async () => {
            state.camera.stop();
            state.measurement.setMaskVisibility(false);
            state.measurement.setMaskLoadingState(true);
            const reset = await state.measurement.reset();
        }
        try {
            state.camera.stop();
            state.measurement.setMaskVisibility(false);
            state.measurement.setMaskLoadingState(true);
            cancelMeaurement();
          } catch (e) {
            console.warn('Failed to cancel after error code', errorCode);
        }
      }
    }
  }, [errorCode]);

  const onClear = () => {
    state.general.setErrorCode(null);
  };

  if (!token || !isPermissionGranted) return null;

  return (
    <Container>
      <div {...stylex.props(styles.pageWrapper)}>
        <MeasurementHeader />
        {errorCode ? <ErrorMessage errorCode={errorCode} onClear={onClear} /> : null}
        <div {...stylex.props(styles.wrapper)}>
          {(showCloseButton || showCameraDevices) && (
            <div {...stylex.props(styles.header)}>
              {showCloseButton && (
                <div {...stylex.props(styles.closeButtonWrapper)}>
                  <CloseButton />
                </div>
              )}
              {showCameraDevices && <CameraDevices />}
            </div>
          )}
          <Measurement />
        </div>
      </div>
    </Container>
  );
};

export default MeasurementPage;
