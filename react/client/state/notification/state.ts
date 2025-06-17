import { proxy } from 'valtio';
import { NotificationState, NotificationTypes } from './types';

const notificationState: NotificationState = proxy({
  isVisible: false,
  type: NotificationTypes.Info,
  content: '',
  clearNotification: () => {
    notificationState.isVisible = false;
    notificationState.type = NotificationTypes.Info;
    notificationState.content = '';
  },
  showNotification: (type: NotificationTypes, content: React.ReactNode) => {
    notificationState.isVisible = true;
    notificationState.type = type;
    notificationState.content = content;
  },
});

export default notificationState;
