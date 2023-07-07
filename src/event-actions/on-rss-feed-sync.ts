import {captureException} from '@app/helpers';
import {RssNews} from '@app/models/rss-news';
import {VariablesBool} from '@app/models/variables-bool';
import {Backend} from '@app/services/backend';

export async function onRssFeedSync(before = new Date()) {
  try {
    const rss_feed = (await Backend.instance.rss_feed(before)) || [];

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
  } catch (e) {
    captureException(e, 'onRssFeedSync');
  }
}
