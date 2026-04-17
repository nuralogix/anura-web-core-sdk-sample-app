import * as stylex from '@stylexjs/stylex';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { StartButton, StartButtonState } from '../StartButton';
import { useCanStartMeasurement } from '../../hooks/useCanStartMeasurement';
import { startCameraStream } from '../../utils/cameraControls';

const styles = stylex.create({
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem 0 1rem',
    gap: '0.25rem',
  },
});

type MeasurementFooterProps = {
  deviceId?: string | null;
};

const MeasurementFooter = ({ deviceId }: MeasurementFooterProps) => {
  const cameraSnap = useSnapshot(state.camera);
  const { isOpen } = cameraSnap;
  const canStartMeasurement = useCanStartMeasurement();

  const getButtonState = (): StartButtonState => {
    if (!isOpen) {
      return StartButtonState.Camera;
    }
    if (!canStartMeasurement) {
      return StartButtonState.RecordDisabled;
    }
    return StartButtonState.Record;
  };

  const handleClick = async () => {
    const buttonState = getButtonState();

    if (buttonState === StartButtonState.Camera) {
      await startCameraStream();
    } else if (buttonState === StartButtonState.Record) {
      await state.measurement.startMeasurement();
    }
  };

  return (
    <div {...stylex.props(styles.footer)}>
      <StartButton state={getButtonState()} onClick={handleClick} disabled={!deviceId} />
    </div>
  );
};

export default MeasurementFooter;
