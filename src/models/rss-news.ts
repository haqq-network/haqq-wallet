import {realm} from '@app/models';
import {RssNewsItem, RssNewsStatus} from '@app/types';

export class RssNews extends Realm.Object implements RssNewsItem {
  static schema = {
    name: 'RssNews',
    properties: {
      id: 'string',
      title: 'string',
      preview: 'string',
      description: 'string',
      url: 'string',
      viewed: 'bool?',
      createdAt: {type: 'date', default: () => new Date()},
      updatedAt: {type: 'date', default: () => new Date()},
      status: 'string',
    },
    primaryKey: 'id',
  };
  id!: string;
  title!: string;
  preview!: string;
  description!: string;
  url!: string;
  createdAt!: Date;
  updatedAt!: Date;
  viewed: boolean;
  status!: string;

  static create(id: string, params: Omit<Partial<RssNews>, 'id'>) {
    const exists = RssNews.getById(id);
    realm.write(() => {
      realm.create<RssNews>(
        RssNews.schema.name,
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
    const obj = realm.objectForPrimaryKey<RssNews>(
      RssNews.schema.name,
      address,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<RssNews>(RssNews.schema.name);
  }

  static getAllApprovedNews() {
    return RssNews.getAll()
      .filtered(`status = "${RssNewsStatus.approved}"`)
      .sorted('createdAt', true);
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<RssNews>(
      RssNews.schema.name,
      id.toLowerCase(),
    );
  }

  static removeAll() {
    const contacts = realm.objects<RssNews>(RssNews.schema.name);

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
  }

  update(params: Partial<RssNews>) {
    realm.write(() => {
      realm.create(
        RssNews.schema.name,
        {
          ...this.toJSON(),
          ...params,
          id: this.id,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
