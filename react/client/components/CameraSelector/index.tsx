import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { useTranslation } from 'react-i18next';
import { Paragraph, Select } from '@nuralogix.ai/web-ui';

const CameraSelector = () => {
  const { t } = useTranslation();
  const snap = useSnapshot(state.camera);
  const { isPermissionGranted, mediaDevices, listCameras, updateDeviceId, deviceId } = snap;

  /**
   * List available cameras on permission granted
   */
  useEffect(() => {
    if (isPermissionGranted) (async () => await listCameras())();
  }, [isPermissionGranted]);

  /**
   * Genrate camera list for the dropdown
   */
  const options = mediaDevices.map((mediaDevice) => ({
    label: mediaDevice.device.label,
    value: mediaDevice.device.deviceId,
  }));

  /**
   * Set the selected device id in useCamera hook
   * @param selectedDevice string
   */
  const onChange = (selectedDevice: string) => {
    updateDeviceId(selectedDevice);
  };

  if (!isPermissionGranted) {
    return <Paragraph>{t('WEB_CAMERA_PERMISSION_REQUIRED_TITLE')}</Paragraph>;
  }

  if (options.length === 0) {
    return <Paragraph>{t('NO_DEVICES_FOUND')}</Paragraph>;
  }

  return (
    <Select
      placeholder={t('WEB_BTN_SELECT_CAMERA')}
      width="350px"
      value={deviceId}
      options={options}
      onChange={onChange}
    />
  );
};

export default CameraSelector;
