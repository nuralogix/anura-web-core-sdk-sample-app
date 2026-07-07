import { proxy, ref } from 'valtio';
import { Log, logCategory, LoggerState } from './types';

// Deep-clone a value into a plain, navigable object for logging — so DevTools shows real objects
// instead of Proxy(Object). It reads properties (going through ANY proxy's get trap: valtio,
// native, or the SDK's recursive readonly proxy), tracks visited objects to survive circular
// references, and drops functions. structuredClone throws on proxies and JSON.parse(JSON.stringify)
// throws on cycles, so neither alone handles the SDK's deeply-proxied objects (e.g. getVersion()).
const toPlain = (value: unknown, seen = new WeakMap<object, unknown>()): unknown => {
  if (value === null || typeof value !== 'object') return value;
  const obj = value as Record<string, unknown>;
  if (seen.has(obj)) return seen.get(obj);
  if (Array.isArray(value)) {
    const arr: unknown[] = [];
    seen.set(obj, arr);
    for (const item of value) arr.push(toPlain(item, seen));
    return arr;
  }
  const out: Record<string, unknown> = {};
  seen.set(obj, out);
  for (const key of Object.keys(obj)) {
    let v: unknown;
    try {
      v = obj[key];
    } catch {
      continue; // skip properties whose getter throws
    }
    if (typeof v === 'function') continue;
    out[key] = toPlain(v, seen);
  }
  return out;
};

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
  saveLogs: process.env.IS_DEVELOPMENT as unknown as boolean,
  setSaveLogs: (save: boolean) => {
    loggerState.saveLogs = save;
  },
  addLog: (message: string, category: logCategory, meta: any) => {
    // Do nothing when logging is off — no unwrap, no console, no array growth.
    if (!loggerState.saveLogs) return;
    const timestamp = getTimestamp();
    const normalizedMeta = typeof meta === 'undefined' ? undefined : toPlain(meta);
    // Log a small styled prefix and hand the meta to console.log as a plain object. DevTools
    // renders objects lazily (collapsed, natively syntax-highlighted), so this stays cheap.
    // The previous colorizeJson approach emitted one `%c` style arg per JSON token (hundreds
    // per object); with DevTools open, building and rendering those synchronously blocked the
    // main thread long enough to starve the on-main-thread ONNX frame pipeline and break the
    // measurement (the collector's >500ms frame-gap error). See the removed colorizeJson.
    const style1 = 'color:blue; font-weight:800;';
    const style2 = `color:${loggerState.getCategoryColor(category)}; font-weight:700;`;
    const style4 = 'font-style:italic;';
    if (typeof normalizedMeta !== 'undefined') {
      console.log('%c%s %c[%s] %c%s', style1, timestamp, style2, category, style4, message, normalizedMeta);
    } else {
      console.log('%c%s %c[%s] %c%s', style1, timestamp, style2, category, style4, message);
    }
    // Store the meta wrapped in valtio ref() so valtio does NOT deep-proxy it. Without this,
    // pushing into loggerState.logs (a valtio proxy) recursively converts the meta's nested
    // objects into valtio proxies IN PLACE — mutating the very object we just passed to
    // console.log, so DevTools (which renders lazily on expand) showed Proxy(Object). This,
    // not the unwrap, was the actual cause of the proxies in the logs.
    const log: Log = {
      message,
      category,
      timestamp,
      meta:
        normalizedMeta !== null && typeof normalizedMeta === 'object'
          ? ref(normalizedMeta as object)
          : normalizedMeta,
    };
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
