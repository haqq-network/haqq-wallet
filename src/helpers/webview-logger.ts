import {WebViewMessageEvent} from 'react-native-webview';

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

const handleEvent = (event: WebViewMessageEvent, prefix = 'WebView') => {
  try {
    const data = JSON.parse(event?.nativeEvent?.data);
    if (data.msg && data.type) {
      // @ts-ignore
      const logger = Logger[data.type];
      // @ts-ignore
      const emoji = LOGS_TYPE_EMOJI_MAP[data.type];
      logger(`${emoji} [${prefix}]:`, ...data.msg);
      return true;
    }
  } catch (e) {}
  return false;
};

export const WebViewLogger = {
  script,
  handleEvent,
};
