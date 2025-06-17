import { proxy } from 'valtio';
import { Log, logCategory, LoggerState } from './types';

const saveLogs = process.env.IS_DEVELOPMENT;

export const getTimestamp = () => {
  const date = new Date();
  // Extract date components
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  // Extract time components
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  // Determine AM/PM and convert to 12-hour format
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight

  // Construct the formatted string
  return `[${month}/${day}/${year}, ${hours}:${minutes}:${seconds}.${milliseconds} ${ampm}]`;
};

const loggerState: LoggerState = proxy({
  logs: [] as Log[],
  addLog: (message: string, category: logCategory, meta: any) => {
    if (!saveLogs) {
      console.log(message);
      return;
    }
    const timestamp = getTimestamp();
    const log: Log = { message, category, timestamp, meta };
    loggerState.logs.push(log);
  },
  clearLogs: () => {
    loggerState.logs = [];
  },
});

export default loggerState;
