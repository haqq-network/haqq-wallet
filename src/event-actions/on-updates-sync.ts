import {captureException} from '@app/helpers';
import {News} from '@app/models/news';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {Backend} from '@app/services/backend';

export async function onUpdatesSync() {
  try {
    const lastSyncUpdates = VariablesDate.get('lastSyncUpdates');
    const {news, rss_feed} =
      (await Backend.instance.updates(lastSyncUpdates)) || {};

    for (const row of news) {
      const exist = News.getById(row.id);

      if (!exist) {
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
      } else {
        exist.update({
          title: row.title,
          preview: row.preview,
          description: row.description,
          content: row.content,
          status: row.status,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          publishedAt: new Date(row.published_at),
        });
      }
    }

    for (const row of rss_feed) {
      const exist = RssNews.getById(row.id);

      if (!exist) {
        RssNews.create(row.id, {
          title: row.title,
          preview: row.preview,
          description: row.description,
          url: row.url,
          status: row.status,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });

        VariablesBool.set('isNewRssNews', true);
      } else {
        exist.update({
          title: row.title,
          preview: row.preview,
          description: row.description,
          url: row.url,
          status: row.status,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });
      }
    }

    VariablesDate.set('lastSyncUpdates', new Date());
  } catch (e) {
    captureException(e, 'sync news');
  }
}
