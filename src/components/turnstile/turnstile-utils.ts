import {DEBUG_VARS} from '@app/debug-vars';
import {WebViewLogger} from '@app/helpers/webview-logger';

import {TurnstileProps} from './turnstile';

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

const WEB_VIEW_LOGGER = DEBUG_VARS.enableCaptchaLogger
  ? `
<script type="text/javascript">
  ${WebViewLogger.script}
</script>
`
  : '';

export const generateWebViewContent = (props: TurnstileProps) => {
  if (props.theme && typeof props.theme === 'string') {
    props.theme = `"${props.theme}"`;
  }

  const {siteKey, theme, languageCode, backgroundColor} = props;

  const apiUrl =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onLoadCallback';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="${apiUrl}" async defer></script>
  ${WEB_VIEW_LOGGER}
</head>
<body>
    <body style="background-color: ${backgroundColor}; -webkit-user-select: none; -ms-user-select: none; user-select: none;">
    <div onclick="window.ReactNativeWebView.postMessage('click-outside')" style="background-color: none;align-self: center; display: flex; align-items: center; justify-content: center;flex: 1; height: 100vh; overflow: hidden;">
      <div onclick="function (event) {event.stopPropagation()}" id="myWidget" style="padding: 2px;"></div>
    </div>
</body>
    <script>
      // This function is called when the Turnstile script is loaded and ready to be used.
      // The function name matches the "onload=..." parameter.
      function onLoadCallback() {
          turnstile.render('#myWidget', {
            sitekey: '${siteKey}',
            theme: ${theme},
            language: '${languageCode}',
            size: "compact",
            callback: (token) => {
              window.ReactNativeWebView.postMessage(token);
            },
            'error-callback': () => {
              window.ReactNativeWebView.postMessage('error');
            }
          });
      }
    </script>
</body>
</html>`;
};
