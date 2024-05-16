import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {News} from '@app/models/news';
import {Transaction} from '@app/models/transaction';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {HomeStackRoutes} from '@app/route-types';
import {Backend} from '@app/services/backend';
import {Indexer} from '@app/services/indexer';
import {MarketingEvents, RaffleStatus, RemoteMessage} from '@app/types';
import {WEI} from '@app/variables/common';

enum PushNotificationTypes {
  news = 'news',
  raffle = 'raffle',
  transaction = 'tx',
}

type Data = {
  type: PushNotificationTypes;
  id: string;
  hash: string;
};

const logger = Logger.create(Events.onPushNotification);

export async function onPushNotification(message: RemoteMessage<Data>) {
  const {id, type, hash} = message.data || {};

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
        const row = await Backend.instance.news_row(id);

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

      navigator.navigate(HomeStackRoutes.NewsDetailPushNotification, {
        id: id,
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
    case PushNotificationTypes.transaction:
      const transaction = await Indexer.instance.getTransaction(
        Wallet.addressList(),
        hash,
      );
      if (transaction) {
        Transaction.create(transaction);
        navigator.navigate(HomeStackRoutes.TransactionDetail, {
          // FIXME: For some reason navigator doesn't understand routing types correctly
          // @ts-ignore
          txId: transaction.id,
          addresses: Wallet.addressList(),
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
