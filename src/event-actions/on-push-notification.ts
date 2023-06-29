import {News} from '@app/models/news';
import {VariablesBool} from '@app/models/variables-bool';
import {navigator} from '@app/navigator';
import {Backend} from '@app/services/backend';
import {RemoteMessage} from '@app/types';

export async function onPushNotification(message: RemoteMessage) {
  if (message.data.type === 'news' && message.data.id) {
    const exists = News.getById(message.data.id);

    if (!exists) {
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

    navigator.navigate('newsDetail', {id: message.data.id});
  }
}
