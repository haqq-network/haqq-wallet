import {onBannerAnalyticsCreate} from '@app/event-actions/on-banner-analytics-click';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {onBannerClaimAirdrop} from '@app/event-actions/on-banner-claim-airdrop';
import {onBannerNotificationsEnable} from '@app/event-actions/on-banner-notifications-enable';
import {onBannerNotificationsNews} from '@app/event-actions/on-banner-notifications-news';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTopicSnooze} from '@app/event-actions/on-banner-notifications-topic-snooze';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {onBannerSnoozeUntil} from '@app/event-actions/on-banner-snooze-until';

export async function onBannerAction(
  id: string,
  event: string,
  params: Record<string, any> = {},
) {
  switch (event) {
    case 'claimCode':
      await onBannerClaimAirdrop(id);
      break;
    case 'close':
      await onBannerSnoozeUntil(id);
      break;
    case 'notificationNews':
      await onBannerNotificationsNews(id);
      break;
    case 'notificationsEnable':
      await onBannerNotificationsEnable(id);
      break;
    case 'notificationsSnooze':
      await onBannerNotificationsSnooze(id);
      break;
    case 'notificationsTopicSubscribe':
      await onBannerNotificationsTopicSubscribe(id, params.topic ?? '');
      break;
    case 'notificationsTopicSnooze':
      await onBannerNotificationsTopicSnooze(id, params.topic ?? '');
      break;
    case 'trackActivityClick':
      await onBannerAnalyticsCreate(id);
      break;
    case 'trackActivityClose':
      await onBannerAnalyticsSnooze(id);
      break;
  }
}
