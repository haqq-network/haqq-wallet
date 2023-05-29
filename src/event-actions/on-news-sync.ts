import {HAQQ_BACKEND} from '@env';

import {captureException} from '@app/helpers';
import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesDate} from '@app/models/variables-date';
import {NewsRow} from '@app/types';
import {getHttpResponse} from '@app/utils';

export async function onNewsSync() {
  try {
    const lastSyncNews = VariablesDate.get('lastSyncNews');
    const sync = lastSyncNews ? `?timestamp=${lastSyncNews.toISOString()}` : '';

    const newsResp = await fetch(`${HAQQ_BACKEND}news${sync}`);
    const news = await getHttpResponse<NewsRow[]>(newsResp);

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

    VariablesDate.set('lastSyncNews', new Date());
  } catch (e) {
    captureException(e, 'sync news');
  }
}
