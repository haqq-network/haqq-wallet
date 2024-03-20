import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {NewsStackRoutes} from '@app/route-types';
import {Backend} from '@app/services/backend';
import {MarketingEvents, RaffleStatus, RemoteMessage} from '@app/types';
import {WEI} from '@app/variables/common';

enum PushNotificationTypes {
  news = 'news',
  raffle = 'raffle',
}

type Data = {
  type: PushNotificationTypes;
  id: string;
};

const logger = Logger.create(Events.onPushNotification);

export async function onPushNotification(message: RemoteMessage<Data>) {
  const {id, type} = message.data || {};

  if (!(id && type)) {
    return logger.warn(
      '"id" or "type" is not defined',
      JSON.stringify({message}, null, 2),
    );
  }

  switch (type) {
    case PushNotificationTypes.news:
      const newsItem = News.getById(id);

      if (!newsItem) {
        const row = await Backend.instance.news_row(message.data.id);

        News.create(row.id, {
          title: row.title,
          preview: row.preview,
          description: row.description,
          content: row.content,
          status: row.status,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          publishedAt: new Date(row.published_at),
        });

        VariablesBool.set('isNewNews', true);
      }

      navigator.navigate(NewsStackRoutes.NewsDetail, {
        id: message.data.id,
        // @ts-ignore
        openEvent: MarketingEvents.newsOpenPushItem,
        linkEvent: MarketingEvents.newsOpenPushLink,
        scrollEvent: MarketingEvents.newsScrolledPushItem,
      });
      break;
    case PushNotificationTypes.raffle:
      let uid = await getUid();
      const response = await Backend.instance.contests(
        Wallet.addressList(),
        uid,
      );
      const raffleItem = response?.find(it => it.id === id);

      if (raffleItem) {
        const prevIslmCount =
          response
            ?.filter?.(it => it.status === RaffleStatus.closed)
            .reduce(
              (prev, curr) =>
                prev +
                (parseInt(curr.budget, 16) / WEI / curr.winners) *
                  curr.winner_tickets,
              0,
            ) || 0;

        const prevTicketsCount =
          response
            ?.filter?.(it => it.status === RaffleStatus.closed)
            .reduce((prev, curr) => prev + curr.winner_tickets, 0) || 0;

        navigator.navigate('raffleDetails', {
          item: raffleItem,
          prevIslmCount,
          prevTicketsCount,
        });
      }

      break;
    default:
      logger.warn(
        'not supported "type" argument',
        JSON.stringify({message}, null, 2),
      );
  }
}
