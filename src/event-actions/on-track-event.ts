import {Adjust, AdjustEvent} from 'react-native-adjust';

import {AdjustEvents} from '@app/types';

export function onTrackEvent(
  event: AdjustEvents,
  params: Record<string, string> = {},
) {
  const adjustEvent = new AdjustEvent(AdjustEvents.pushChannelSubscribe);

  Object.entries(params).forEach(([key, value]) => {
    adjustEvent.addPartnerParameter(key, value);
  });

  Adjust.trackEvent(adjustEvent);
}
