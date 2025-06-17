import { useSnapshot } from 'valtio';
import { Modal } from '@nuralogix.ai/web-ui';
import state from '../../state';
import { NotificationTypes } from '../../state/notification/types';

const Notification = () => {
  const { isVisible, type, content, clearNotification } = useSnapshot(state.notification);
  const getModalVariant = () => {
    if (type === NotificationTypes.Warning) {
      return 'warning';
    }
    if (type === NotificationTypes.Error) {
      return 'danger';
    }
    return 'primary';
  };

  return isVisible ? (
    <Modal
      isOpen
      onClose={() => clearNotification()}
      showConfirmButton={false}
      variant={getModalVariant()}
    >
      <>{content}</>
    </Modal>
  ) : null;
};

export default Notification;
