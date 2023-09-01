import {DEBUG_VARS} from '@app/debug-vars';
import {WebViewLogger} from '@app/helpers/webview-logger';

import {ReCaptchaV2Props} from './re-captcha-v2';

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

export const generateWebViewContent = (props: ReCaptchaV2Props) => {
  if (props.theme && typeof props.theme === 'string') {
    props.theme = `"${props.theme}"`;
  }

  const {siteKey, theme, languageCode, backgroundColor} = props;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  ${WEB_VIEW_LOGGER}
 
  <script src="https://www.google.com/recaptcha/api.js?hl=${languageCode}" async defer></script>
  <script type="text/javascript">
    var dataCallback = function(data) {
      window.ReactNativeWebView.postMessage(data)
    }

    var dataExpiredCallback = function() {
      window.ReactNativeWebView.postMessage('expired')
    }

    var dataErrorCallback = function(data) {
      window.ReactNativeWebView.postMessage('error')
    }
  </script>
</head>
<body style="background-color: ${backgroundColor}; -webkit-user-select: none; -ms-user-select: none; user-select: none;">
    <div onclick="window.ReactNativeWebView.postMessage('click-outside')" style="background-color: none;align-self: center; display: flex; align-items: center; justify-content: center;flex: 1; height: 100vh; overflow: hidden;">
      <form action="?" method="POST">
        <div 
          class="g-recaptcha" 
          data-size="compact"
          data-sitekey="${siteKey}"
          data-theme=${theme}
          data-callback="dataCallback"
          data-expired-callback="dataExpiredCallback"
          data-error-callback="dataErrorCallback"
        ></div>
      </form>
    </div>
</body>
</html>`;
};
