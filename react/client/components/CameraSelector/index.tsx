import { useSnapshot } from 'valtio';
import state from '../../state';
import { useTranslation } from 'react-i18next';
import { Select } from '@nuralogix.ai/web-ui';

const CameraSelector = () => {
  const { t } = useTranslation();
  const { mediaDevices, deviceId } = useSnapshot(state.camera);

  /**
   * List available cameras on permission granted
   */
  const options = mediaDevices.map((d) => ({ label: d.device.label, value: d.device.deviceId }));

  /**
   * Set the selected device id in useCamera hook
   * @param selectedDevice string
   */
  const onChange = (selectedDevice: string) => state.camera.updateDeviceId(selectedDevice);

  return (
    <Select
      placeholder={t('SELECT_CAMERA')}
      width="350px"
      value={deviceId}
      options={options}
      onChange={onChange}
    />
  );
};

export default CameraSelector;
