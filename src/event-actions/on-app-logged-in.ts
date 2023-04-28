import {HAQQ_BACKEND} from '@env';
import {Image} from 'react-native';

import {Events} from '@app/events';
import {captureException} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {NewsRow} from '@app/types';
import {getPatternName} from '@app/utils';

export async function onAppLoggedIn() {
  const wallets = Wallet.getAllVisible();

  await Promise.all(
    Wallet.getAllVisible().map(w => Image.prefetch(getPatternName(w.pattern))),
  );

  await Promise.all(
    wallets.map(wallet =>
      awaitForEventDone(Events.onTransactionsLoad, wallet.address),
    ),
  );

  try {
    const lastSyncNews = VariablesDate.get('lastSyncNews');
    const sync = lastSyncNews ? `?timestamp=${lastSyncNews.toISOString()}` : '';

    const newsResp = await fetch(`${HAQQ_BACKEND}news${sync}`);
    const news = (await newsResp.json()) as NewsRow[];

    for (const row of news) {
      const exist = News.getById(row.id);

      if (!exist) {
        News.create(row.id, {
          title: row.title,
          preview: row.preview,
          description: row.description,
          content: row.content,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          publishedAt: new Date(row.published_at),
        });

        VariablesBool.set('isNewNews', true);
      } else {
        exist.update({
          title: row.title,
          preview: row.preview,
          description: row.description,
          content: row.content,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          publishedAt: new Date(row.published_at),
        });
      }
    }

    VariablesDate.set('lastSyncNews', new Date());
  } catch (e) {
    captureException(e, 'sync news');
  }
  await WalletConnect.instance.init();
}
