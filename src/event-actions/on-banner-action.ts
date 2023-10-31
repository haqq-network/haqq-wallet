import {Alert} from 'react-native';

import {onBannerAnalyticsCreate} from '@app/event-actions/on-banner-analytics-click';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {onBannerClaimAirdrop} from '@app/event-actions/on-banner-claim-airdrop';
import {onBannerNotificationsEnable} from '@app/event-actions/on-banner-notifications-enable';
import {onBannerNotificationsNews} from '@app/event-actions/on-banner-notifications-news';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTopicSnooze} from '@app/event-actions/on-banner-notifications-topic-snooze';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {onBannerSnoozeUntil} from '@app/event-actions/on-banner-snooze-until';
import {BannerButtonEvent} from '@app/models/banner';

export async function onBannerAction(
  id: string,
  event: BannerButtonEvent | string,
  params: Record<string, any> = {},
) {
  if (event === BannerButtonEvent.test) {
    return Alert.alert('Test button clicked', JSON.stringify(params, null, 2));
  }

  switch (event) {
    case BannerButtonEvent.claimCode:
      await onBannerClaimAirdrop(id);
      break;
    case BannerButtonEvent.close:
      await onBannerSnoozeUntil(id);
      break;
    case BannerButtonEvent.notificationNews:
      await onBannerNotificationsNews(id);
      break;
    case BannerButtonEvent.notificationsEnable:
      await onBannerNotificationsEnable(id);
      break;
    case BannerButtonEvent.notificationsSnooze:
      await onBannerNotificationsSnooze(id);
      break;
    case BannerButtonEvent.notificationsTopicSubscribe:
      await onBannerNotificationsTopicSubscribe(id, params.topic ?? '');
      break;
    case BannerButtonEvent.notificationsTopicSnooze:
      await onBannerNotificationsTopicSnooze(id, params.topic ?? '');
      break;
    case BannerButtonEvent.trackActivityClick:
      await onBannerAnalyticsCreate(id);
      break;
    case BannerButtonEvent.trackActivityClose:
      await onBannerAnalyticsSnooze(id);
      break;
  }
}
