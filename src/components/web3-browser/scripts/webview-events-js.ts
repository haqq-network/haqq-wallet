export enum WebViewEventsEnum {
  WINDOW_INFO = 'WINDOW_INFO',
  ACCOUNTS_CHANGED = 'ACCOUNTS_CHANGED',
}

export interface WindowInfoEvent {
  type: WebViewEventsEnum.WINDOW_INFO;
  payload: {
    url: string;
    title?: string;
    icon?: string;
  };
}

const getWindowInformation = `
  (function () {
    const shortcutIcon = window.document.querySelector('head > link[rel="shortcut icon"]');
    const icon = shortcutIcon || Array.from(window.document.querySelectorAll('head > link[rel="icon"]')).find((icon) => Boolean(icon.href));
    const siteName = document.querySelector('head > meta[property="og:site_name"]');
    const title = siteName || document.querySelector('head > meta[name="title"]');

    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(
      {
        type: '${WebViewEventsEnum.WINDOW_INFO}',
        payload: {
          title: title ? title.content : document.title,
          url: location.href,
          icon: icon && icon.href
        }
      }
    ));
  })();
  true;
`;

export const WebViewEventsJS = {
  getWindowInformation,
};
