import CameraSelector from '../../components/CameraSelector';
import CameraToggle from '../../components/CameraToggle';
import Measurement from '../../components/Measurement';
import ViewResults from '../../components/ViewResults';
import HelpPopover from '../../components/HelpPopover';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { faceTrackerState as trackingState } from '@nuralogix.ai/anura-web-core-sdk';
import { Button, Loading } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';

const styles = stylex.create({
  selectContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
    margin: 'auto',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
});

const MeasurementPage = () => {
  const { LOADING, LOADED, READY } = trackingState;
  const { t } = useTranslation();
  const measurementSnap = useSnapshot(state.measurement);
  const { isMeasurementInProgress, isMeasurementComplete, isAnalyzingResults } = measurementSnap;
  const { deviceId } = useSnapshot(state.camera);
  const { faceTrackerState } = measurementSnap;
  const isFaceTrackerLoaded = faceTrackerState === LOADED || faceTrackerState === READY;

  const handleCancel = () => {};

  return (
    <div>
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
      {faceTrackerState === LOADING && (
        <div {...stylex.props(styles.spinner)}>
          <Loading />
        </div>
      )}
      {isFaceTrackerLoaded && deviceId && <CameraToggle />}

      {isMeasurementComplete && <ViewResults />}
    </div>
  );
};

export default MeasurementPage;
