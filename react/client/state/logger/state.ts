import { proxy } from 'valtio';
import { Log, logCategory, LoggerState } from './types';

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


const colorizeJson = (obj: any) => {
  const json = JSON.stringify(obj, null, 2);
  const regex = /("(?:\\[\s\S]|[^"\\])*"(?:\s*:)?)|(true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|([\{\}\[\]\,])|(\s+)/g;
  let fmt = '';
  const args: string[] = [];
  let match;
  while ((match = regex.exec(json)) !== null) {
    if (match[1]) {
      if (/:$/.test(match[1])) {
        fmt += '%c' + match[1];
        args.push('color: red');
      } else {
        fmt += '%c' + match[1];
        args.push('color: blue');
      }
    } else if (match[2]) {
      fmt += '%c' + match[2];
      args.push('color: blue');
    } else if (match[3]) {
      fmt += '%c' + match[3];
      args.push('color: black');
    } else if (match[4]) {
      fmt += '%c' + match[4];
      args.push('color: inherit');
    }
  }
  return { fmt, args };
};

const loggerState: LoggerState = proxy({
  logs: [] as Log[],
  saveLogs: process.env.IS_DEVELOPMENT as unknown as boolean,
  setSaveLogs: (save: boolean) => {
    loggerState.saveLogs = save;
  },
  addLog: (message: string, category: logCategory, meta: any) => {
    const timestamp = getTimestamp();
    const normalizedMeta =
      typeof meta === 'undefined' ? undefined : JSON.parse(JSON.stringify(meta));
    if (loggerState.saveLogs) {
      const text2 = `[${category}]`;
      const text3 = "  ";
      const style1 = `color:${'blue'}; font-weight:800;`;
      const style2 = `color:${loggerState.getCategoryColor(category)}; font-weight:700;`;
      const style3 = "background:inherit;";
      const style4 = "font-style: italic;";
      const style5 = "font-style: normal; font-weight: normal; color: black;";

      let extraFormat = '';
      const extraArgs: string[] = [];

      if (typeof normalizedMeta !== 'undefined') {
        const { fmt, args } = colorizeJson(normalizedMeta);
        // check the size of args before pushing data to extraArgs.
        // If args.length exceeds 1000, it falls back to logging the
        // metadata separately using console.log(meta), avoiding the
        // stack overflow while still preserving the log information
        if (args.length > 1000) {
          console.log(
            '%c%s%c%s%c%s%c%s',
            style1,
            timestamp,
            style2,
            text2,
            style3,
            text3,
            style4,
            message
          );
          console.log(normalizedMeta);
          return;
        }
        extraFormat = "%c\n" + fmt;
        extraArgs.push(style5, ...args);
      }

      console.log("%c%s%c%s%c%s%c%s" + extraFormat, style1, timestamp, style2, text2, style3, text3, style4, message, ...extraArgs);
    }
    const log: Log = { message, category, timestamp, meta: normalizedMeta };
    loggerState.logs.push(log);
  },
  getCategoryColor(category: logCategory) {
    switch (category) {
      case logCategory.measurement :
        return 'red';
      case logCategory.camera:
        return '#94562c';
      case logCategory.collector:
        return 'violet';
      case logCategory.app:
        return 'green';
      default:
        return 'black';
    }
  },
  getLogs: () => {
    return loggerState.logs;
  },
  clearLogs: () => {
    loggerState.logs = [];
  },
});

export default loggerState;
