import {Color} from '@app/colors';
import {onBannerAnalyticsCreate} from '@app/event-actions/on-banner-analytics-click';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {onBannerClaimAirdrop} from '@app/event-actions/on-banner-claim-airdrop';
import {onBannerNotificationsEnable} from '@app/event-actions/on-banner-notifications-enable';
import {onBannerNotificationsNews} from '@app/event-actions/on-banner-notifications-news';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTopicSnooze} from '@app/event-actions/on-banner-notifications-topic-snooze';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {onBannerSnoozeUntil} from '@app/event-actions/on-banner-snooze-until';
import {showModal} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

export async function onBannerAction(
  id: string,
  event: string,
  params: Record<string, any> = {},
) {
  switch (event) {
    case 'claimCode':
      try {
        await onBannerClaimAirdrop(id);
      } catch (e) {
        if (e instanceof Error) {
          showModal('error', {
            title: getText(I18N.modalRewardErrorTitle),
            description: e.message,
            close: getText(I18N.modalRewardErrorClose),
            icon: 'reward_error',
            color: Color.graphicSecond4,
          });
        }
      }
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
