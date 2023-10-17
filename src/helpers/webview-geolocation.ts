import Geolocation, {
  GeolocationOptions,
} from '@react-native-community/geolocation';
import WebView, {WebViewMessageEvent} from 'react-native-webview';

import {I18N} from '@app/i18n';
import {BrowserPermission} from '@app/models/browser-permission';
import {VariablesString} from '@app/models/variables-string';
import {sendNotification} from '@app/services/toast';
import {BrowserPermissionStatus, BrowserPermissionType} from '@app/types';

import {getHost} from './web3-browser-utils';
import {
  checkGeoPermissions,
  enableGeoPermissions,
} from './webview-geolocation-permission-helper';

export enum BrowserGeolocationEvents {
  getCurrentPosition = 'getCurrentPosition',
  watchPosition = 'watchPosition',
  clearWatch = 'clearWatch',
}

export const GEO_WATCH_ID_KEY = 'browser.geolocation.watchID';

type GetCurrentPositionEvent = {
  event: BrowserGeolocationEvents.getCurrentPosition;
  options?: GeolocationOptions;
};

type WatchPositionEvent = {
  event: BrowserGeolocationEvents.watchPosition;
  options?: GeolocationOptions;
};

type ClearWatchEvent = {
  event: BrowserGeolocationEvents.clearWatch;
  watchID: number;
};

export type GeolocationRequestEvent =
  | GetCurrentPositionEvent
  | WatchPositionEvent
  | ClearWatchEvent;

export const isBrowserGeolocationRequestEvent = (
  data: any,
): data is GeolocationRequestEvent => {
  return Object.values(BrowserGeolocationEvents).includes(data?.event);
};

export const getBrowserGeolocationEventData = (event: WebViewMessageEvent) => {
  let data = {};

  try {
    data = JSON.parse(event.nativeEvent?.data);
  } catch (e) {
    return null;
  }

  if (isBrowserGeolocationRequestEvent(data)) {
    return data;
  }

  return null;
};

const showGeolocationPermissionPropmt = (hostname: string) => {
  return BrowserPermission.showPermissionPropmt(
    hostname,
    I18N.browserGeolocationPermissionPromptTitle,
    I18N.browserGeolocationPermissionPromptMessage,
  );
};

const checkGeoLocationPermissionForSite = (hostname: string) => {
  return BrowserPermission.checkPermission(
    hostname,
    BrowserPermissionType.geolocation,
  );
};

const requestGeoLocationPermissionForSite = async (
  url: string,
): Promise<boolean> => {
  if (url) {
    const hostname = getHost(url);

    sendNotification(I18N.browserGeolocationPermissioUseLocationMessage, {
      hostname,
    });

    const isAuthorizedPermission = checkGeoLocationPermissionForSite(hostname);

    if (isAuthorizedPermission) {
      BrowserPermission.update(hostname, {
        type: BrowserPermissionType.geolocation,
        lastUsedAt: Date.now(),
      });
      return true;
    } else {
      const permission = BrowserPermission.getByHostnameAndType(
        hostname,
        BrowserPermissionType.geolocation,
      );
      const status = await showGeolocationPermissionPropmt(hostname);

      if (permission) {
        BrowserPermission.update(hostname, {
          type: BrowserPermissionType.geolocation,
          lastUsedAt: Date.now(),
          status,
        });
      } else {
        BrowserPermission.create(hostname, {
          type: BrowserPermissionType.geolocation,
          status,
        });
      }

      switch (status) {
        case BrowserPermissionStatus.allow:
        case BrowserPermissionStatus.allowOnce:
          return true;
        case BrowserPermissionStatus.deny:
          return false;
      }
    }
  }
  return false;
};

let geolocationEnabled = false;

/**
 * @return `true` if request handled
 */
const handleGeolocationRequest = async (
  ref: WebView,
  event: WebViewMessageEvent,
) => {
  const data = getBrowserGeolocationEventData(event);

  if (!data) {
    return false;
  }

  const rejectResponse = (err?: any) => {
    ref.postMessage(
      JSON.stringify({
        event: `${data.event}Error`,
        data: err || 'Permission denied',
      }),
    );
    return true;
  };

  Logger.log(
    'BrowserPermission.getAll()',
    JSON.stringify(BrowserPermission.getAll(), null, 2),
  );

  // no need request permission for clearWatch
  if (data.event === BrowserGeolocationEvents.clearWatch) {
    if (typeof data.watchID === 'number') {
      Geolocation.clearWatch(data.watchID);
    }
    return rejectResponse('`watchID` is undefined');
  }

  const isAuthorizedPermission = await requestGeoLocationPermissionForSite(
    event.nativeEvent.url,
  );

  Logger.log('isAuthorizedPermission', isAuthorizedPermission);

  if (!isAuthorizedPermission) {
    return rejectResponse();
  }

  if (!geolocationEnabled) {
    geolocationEnabled = await checkGeoPermissions();
    Logger.log('geolocationEnabled', geolocationEnabled);
    if (!geolocationEnabled) {
      const isGranted = await enableGeoPermissions();
      Logger.log('isGranted', isGranted);
      if (!isGranted) {
        return rejectResponse();
      }
    }
  }

  Logger.log(
    '🟢handleGeolocationRequest',
    event.nativeEvent.url,
    JSON.stringify(data, null, 2),
  );

  switch (data.event) {
    case BrowserGeolocationEvents.getCurrentPosition:
      Geolocation.getCurrentPosition(
        position => {
          ref.postMessage(
            JSON.stringify({event: 'currentPosition', data: position}),
          );
        },
        rejectResponse,
        data.options,
      );
      return true;
    case BrowserGeolocationEvents.watchPosition:
      const watchID = Geolocation.watchPosition(
        position => {
          ref.postMessage(
            JSON.stringify({
              event: 'watchPosition',
              data: {...position, watchID},
            }),
          );
        },
        rejectResponse,
        data.options,
      );
      VariablesString.set(GEO_WATCH_ID_KEY, String(watchID));
      return true;
    default:
      return false;
  }
};

const getCurrentPosition = `
    navigator.geolocation.getCurrentPosition = (success, error, options) => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'getCurrentPosition', options: options }));

      window.addEventListener('message', (e) => {
        let eventData = {}
        try {
          eventData = JSON.parse(e.data);
        } catch (e) {}

        if (eventData.event === 'currentPosition') {
          success(eventData.data);
        } else if (eventData.event === 'currentPositionError') {
          error(eventData.data);
        }
      });
    };
    true;
  `;

const watchPosition = `
    navigator.geolocation.watchPosition = (success, error, options) => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'watchPosition', options: options }));

      window.addEventListener('message', (e) => {
        let eventData = {}
        try {
          eventData = JSON.parse(e.data);
        } catch (e) {}

        if (eventData.event === 'watchPosition') {
          console.log('eventData', eventData);
          success(eventData.data);
        } else if (eventData.event === 'watchPositionError') {
          error(eventData.data);
        }
      });
    };
    true;
  `;

const clearWatch = `
    navigator.geolocation.clearWatch = (watchID) => {
      window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'clearWatch', watchID: watchID }));
    };
    true;
  `;

const script = `
    (function() {
      ${getCurrentPosition}
      ${watchPosition}
      ${clearWatch}
    })();
  `;

export const WebViewGeolocation = {
  handleGeolocationRequest,
  script,
};
