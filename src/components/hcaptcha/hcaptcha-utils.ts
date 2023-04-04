import {DEBUG_VARS} from '@app/debug-vars';
import {WebViewLogger} from '@app/helpers/webview-logger';

import {HcaptchaProps} from './hcaptcha';

export const patchPostMessageJsCode = `
(function () {
  var originalPostMessage = window.ReactNativeWebView.postMessage;
  var patchedPostMessage = function (message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer);
  };
  patchedPostMessage.toString = function () {
    return String(Object.hasOwnProperty).replace(
      'hasOwnProperty',
      'postMessage',
    );
  };
  window.ReactNativeWebView.postMessage = patchedPostMessage;
})();
`;

const buildHcaptchaApiUrl = (props: HcaptchaProps) => {
  let {
    jsSrc,
    siteKey,
    languageCode: hl,
    theme,
    host,
    sentry,
    endpoint,
    assethost,
    imghost,
    reportapi,
  } = props;
  let url = `${
    jsSrc || 'https://hcaptcha.com/1/api.js'
  }?render=explicit&onload=onloadCallback`;

  if (host) {
    host = encodeURIComponent(host);
  } else {
    host = (siteKey || 'missing-sitekey') + '.react-native.hcaptcha.com';
  }

  for (let [key, value] of Object.entries({
    host,
    hl,
    custom: typeof theme === 'object',
    sentry,
    endpoint,
    assethost,
    imghost,
    reportapi,
  })) {
    if (value) {
      url += `&${key}=${encodeURIComponent(value)}`;
    }
  }

  return url;
};

const WEB_VIEW_LOGGER = DEBUG_VARS.enableCaptchaLogger
  ? `
<script type="text/javascript">
  ${WebViewLogger.script}
</script>
`
  : '';

export const generateWebViewContent = (props: HcaptchaProps) => {
  if (props.theme && typeof props.theme === 'string') {
    props.theme = `"${props.theme}"`;
  }

  if (props.rqdata && typeof props.rqdata === 'string') {
    props.rqdata = `"${props.rqdata}"`;
  }

  const {
    siteKey,
    theme,
    size,
    enableAutoOpenChallenge,
    rqdata,
    backgroundColor,
  } = props;
  const apiUrl = buildHcaptchaApiUrl(props);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  ${WEB_VIEW_LOGGER}
  <script src="${apiUrl}" async defer></script>
  <script type="text/javascript">
    var onloadCallback = function() {
      try {
        console.log("challenge onload starting");
        hcaptcha.render("submit", getRenderConfig("${
          siteKey || ''
        }", ${theme}, "${size || 'invisible'}"));
        // have loaded by this point; render is sync.
        console.log("challenge render complete");
      } catch (e) {
        console.log("challenge failed to render");
        window.ReactNativeWebView.postMessage("error");
      }
      try {
        console.log("showing challenge");
        if(${enableAutoOpenChallenge}) {
          hcaptcha.execute(getExecuteOpts());
        }
      } catch (e) {
        console.log("failed to show challenge");
        window.ReactNativeWebView.postMessage("error");
      }
    };
    var onDataCallback = function(response) {
      window.ReactNativeWebView.postMessage(response);
    };
    var onCancel = function() {
      window.ReactNativeWebView.postMessage("chalcancel");
    };
    var onOpen = function() {
      // NOTE: disabled for simplicity.
      // window.ReactNativeWebView.postMessage("open");
      console.log("challenge opened");
    };
    var onDataExpiredCallback = function(error) { window.ReactNativeWebView.postMessage("expired"); };
    var onChalExpiredCallback = function(error) { window.ReactNativeWebView.postMessage("chalexpired"); };
    var onDataErrorCallback = function(error) {
      console.log("challenge error callback fired");
      window.ReactNativeWebView.postMessage("error");
    };
    const getRenderConfig = function(siteKey, theme, size) {
      var config = {
        sitekey: siteKey,
        size: size,
        callback: onDataCallback,
        "close-callback": onCancel,
        "open-callback": onOpen,
        "expired-callback": onDataExpiredCallback,
        "chalexpired-callback": onChalExpiredCallback,
        "error-callback": onDataErrorCallback
      };
      if (theme) {
        config.theme = theme;
      }
      return config;
    };
    const getExecuteOpts = function() {
      var opts;
      const rqdata = ${rqdata};
      if (rqdata) {
        opts = {"rqdata": rqdata};
      }
      return opts;
    };
  </script>
</head>
<body style="background-color: ${backgroundColor}; -webkit-user-select: none; -ms-user-select: none; user-select: none;">
    <div onclick="window.ReactNativeWebView.postMessage('click-outside')" style="background-color: none;align-self: center; display: flex; align-items: center; justify-content: center;flex: 1; height: 100vh; overflow: hidden;">
      <div onclick="function (event) {event.stopPropagation()}" id="submit" style="padding: 2px;"></div>
    </div>
</body>
</html>`;
};
