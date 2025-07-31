import CameraSelector from '../../components/CameraSelector';
import Measurement from '../../components/Measurement';
import HelpPopover from '../../components/HelpPopover';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { faceTrackerState as trackingState } from '@nuralogix.ai/anura-web-core-sdk';
import { Button } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const styles = stylex.create({
  wrapper: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  selectContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
    margin: 'auto',
    minHeight: '3rem',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
});

const MeasurementPage = () => {
  const { LOADED, READY } = trackingState;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const measurementSnap = useSnapshot(state.measurement);
  const { isMeasurementInProgress, isAnalyzingResults } = measurementSnap;
  const { faceTrackerState, setMaskVisibility, setMaskLoadingState } = measurementSnap;
  const { isOpen } = useSnapshot(state.camera);
  const isFaceTrackerLoaded = faceTrackerState === LOADED || faceTrackerState === READY;

  const handleCancel = async () => {
    if (isOpen) state.camera.stop();
    setMaskVisibility(false);
    setMaskLoadingState(true);
    navigate('/');
  };

  return (
    <div {...stylex.props(styles.wrapper)}>
      {isFaceTrackerLoaded && (
        <div {...stylex.props(styles.selectContainer)}>
          <Button variant="link" onClick={handleCancel}>
            {t('CANCEL')}
          </Button>
          {!isMeasurementInProgress && !isAnalyzingResults && (
            <>
              <CameraSelector />
              <HelpPopover />
            </>
          )}
        </div>
      )}
      <Measurement />
    </div>
  );
};

export default MeasurementPage;