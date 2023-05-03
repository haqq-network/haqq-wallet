import {realm} from '@app/models';

export class News extends Realm.Object {
  static schema = {
    name: 'News',
    properties: {
      id: 'string',
      title: 'string',
      preview: 'string',
      description: 'string',
      content: 'string',
      publishedAt: 'date?',
      viewed: 'bool?',
      createdAt: {type: 'date', default: () => new Date()},
      updatedAt: {type: 'date', default: () => new Date()},
    },
    primaryKey: 'id',
  };
  id!: string;
  title!: string;
  preview!: string;
  description!: string;
  content!: string;
  publishedAt: Date;
  createdAt!: Date;
  updatedAt!: Date;
  viewed: boolean;

  static create(id: string, params: Omit<Partial<News>, 'id'>) {
    const exists = News.getById(id);
    realm.write(() => {
      realm.create<News>(
        News.schema.name,
        {
          ...(exists ?? {}),
          ...params,
          id: id.toLowerCase(),
        },
        Realm.UpdateMode.Modified,
      );
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
