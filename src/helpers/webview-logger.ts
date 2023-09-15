import {WebViewMessageEvent} from 'react-native-webview';

export type WebViewLogType = 'log' | 'error' | 'warn';

export type WebViewLogEvent = {
  msg: any[];
  type: WebViewLogType;
};

const script = `
  if(!window._webViewLoggerInjected){
    var origLog = console.log;
    console.log = (...args) => {
        origLog(...args);
        window.ReactNativeWebView.postMessage(JSON.stringify({ msg: args, type: "log" }));
    }
    var origError = console.error;
    console.error = (...args) => {
        origError(...args);
        window.ReactNativeWebView.postMessage(JSON.stringify({ msg: args, type: "error" }));
    }
    var origWarn = console.warn;
    console.warn = (...args) => {
        origWarn(...args);
        window.ReactNativeWebView.postMessage(JSON.stringify({ msg: args, type: "warn" }));
    }
    window.addEventListener("error", console.error);
    window._webViewLoggerInjected = true;
  }
`;

const LOGS_TYPE_EMOJI_MAP = {
  log: '🟢',
  error: '🔴',
  warn: '🟡',
};

const checkData = (data: any): data is WebViewLogEvent => {
  return !!data?.msg && ['log', 'error', 'warn'].includes(data.type);
};

const handleEvent = (event: WebViewMessageEvent, prefix: string) => {
  try {
    const data = JSON.parse(event?.nativeEvent?.data);
    if (checkData(data)) {
      const emoji = LOGS_TYPE_EMOJI_MAP[data.type];
      Logger[data.type].call(
        Logger,
        emoji,
        `[${prefix}]:`,
        event?.nativeEvent?.url,
        '\n\n',
        ...data.msg,
      );
      return true;
    }
  } catch (e) {}
  return false;
};

export const WebViewLogger = {
  script,
  handleEvent,
};
