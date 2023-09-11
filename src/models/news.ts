import {realm} from '@app/models';
import {NewsItem} from '@app/types';

export class News extends Realm.Object implements NewsItem {
  static schema = {
    name: 'News',
    properties: {
      id: 'string',
      title: 'string',
      preview: 'string?',
      description: 'string',
      content: 'string',
      publishedAt: 'date?',
      viewed: 'bool?',
      createdAt: {type: 'date', default: () => new Date()},
      updatedAt: {type: 'date', default: () => new Date()},
      status: 'string',
    },
    primaryKey: 'id',
  };
  id!: string;
  title!: string;
  preview?: string;
  description!: string;
  content!: string;
  publishedAt: Date;
  createdAt!: Date;
  updatedAt!: Date;
  viewed: boolean;
  status!: string;

  static create(id: string, params: Omit<Partial<News>, 'id'>) {
    const exists = News.getById(id);

    const getField = (
      fieldName: keyof NewsItem,
      defaultValue: string | Date | boolean = '',
      //@ts-ignore
    ) => exists?.[fieldName] ?? params?.[fieldName] ?? defaultValue;

    const newItem: NewsItem = {
      id: id.toLowerCase(),
      title: getField('title'),
      preview: getField('preview', undefined),
      description: getField('description'),
      content: getField('content'),
      publishedAt: getField('publishedAt', new Date()),
      createdAt: getField('createdAt', new Date()),
      updatedAt: getField('updatedAt', new Date()),
      viewed: getField('viewed', false),
      status: getField('status', 'unknown'),
    };

    realm.write(() => {
      realm.create<News>(News.schema.name, newItem, Realm.UpdateMode.Modified);
    });

    return id;
  }

  static remove(address: string) {
    const obj = realm.objectForPrimaryKey<News>(News.schema.name, address);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<News>(News.schema.name);
  }

  static getAllPublishedNews() {
    return realm
      .objects<News>(News.schema.name)
      .filtered('status = "published"')
      .sorted('createdAt', true);
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<News>(News.schema.name, id.toLowerCase());
  }

  static removeAll() {
    const contacts = realm.objects<News>(News.schema.name);

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
  }

  update(params: Partial<News>) {
    realm.write(() => {
      realm.create(
        News.schema.name,
        {
          ...this.toJSON(),
          ...params,
          updatedAt: new Date(),
          id: this.id,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
