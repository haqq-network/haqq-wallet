import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {Banner} from '@app/models/banner';
import {PushNotifications} from '@app/services/push-notifications';

export async function onBannerNotificationsTurnOn(id: string) {
  const banner = Banner.getById(id);

  if (!banner) {
    throw new Error('Banner not found');
  }

  await PushNotifications.instance.requestPermissions();

  Banner.remove(id);

  await awaitForEventDone(Events.onPushSubscriptionAdd);
  await onBannerNotificationTopicCreate('news');
}
