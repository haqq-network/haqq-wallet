import {WebViewMessageEvent} from 'react-native-webview';

import {onTrackEvent} from '@app/event-actions/on-track-event';
import {AdjustEvents} from '@app/types';

import {Whitelist} from './whitelist';

export enum AdjustMiddlewareEventNames {
  adjustTrackEvent = 'adjustTrackEvent',
}

type AdjustTrackEvent = {
  event: AdjustMiddlewareEventNames.adjustTrackEvent;
  data: {
    event: AdjustEvents;
    params: Record<string, string>;
  };
};

export type AdjustMiddlewareEvents = AdjustTrackEvent;

const isAdjustMiddlewareEvent = (data: any): data is AdjustMiddlewareEvents => {
  return Object.values(AdjustMiddlewareEventNames).includes(data?.event);
};

const getAdjustMiddlewareEventData = (event: WebViewMessageEvent) => {
  let data = {};

  try {
    data = JSON.parse(event.nativeEvent?.data);
  } catch (e) {
    return null;
  }

  if (isAdjustMiddlewareEvent(data)) {
    return data;
  }

  return null;
};

export const WebviewAjustMiddleware = {
  script: `
        window.__HAQQWALLET__.trackEvent = (event, params) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: '${AdjustMiddlewareEventNames.adjustTrackEvent}', data: { event, params } }));
        };
        true
    `,
  handleMessage: async (event: WebViewMessageEvent) => {
    const eventData = getAdjustMiddlewareEventData(event);

    if (!eventData) {
      return false;
    }

    const isAllowedDomain = await Whitelist.checkUrl(
      event.nativeEvent.url,
      false,
    );

    if (!isAllowedDomain) {
      Logger.warn('WebviewAjustMiddleware: domain is not allowed');
      return true;
    }

    const data = eventData.data;

    switch (eventData.event) {
      case AdjustMiddlewareEventNames.adjustTrackEvent:
        onTrackEvent(data.event, data.params);
        return true;
      default:
        return false;
    }
  },
};
