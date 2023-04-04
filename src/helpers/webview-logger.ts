import {WebViewMessageEvent} from 'react-native-webview';

const script = `
  if(!window._webViewLoggerInjected){
    console.log = (...args) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ msg: args, type: "log" }));
    }
    console.error = (...args) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ msg: args, type: "error" }));
    }
    console.warn = (...args) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ msg: args, type: "warn" }));
    }
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
      const logger = console[data.type];
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
