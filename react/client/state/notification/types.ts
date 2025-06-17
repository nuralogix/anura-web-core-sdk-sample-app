export enum NotificationTypes {
  Info,
  Warning,
  Error,
}

export interface NotificationState {
  isVisible: boolean;
  type: NotificationTypes;
  content: React.ReactNode;
  clearNotification: () => void;
  showNotification: (type: NotificationTypes, content: React.ReactNode) => void;
}
