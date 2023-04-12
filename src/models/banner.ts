import {BSON} from 'realm';

import {realm} from '@app/models/index';

export class BannerButton extends Realm.Object {
  static schema = {
    name: 'BannerButton',
    properties: {
      id: 'objectId',
      title: 'string',
      event: 'string',
      params: 'string{}',
      color: 'string',
      backgroundColor: 'string',
    },
  };
  id!: BSON.ObjectId;
  title!: string;
  event!: 'claimCode' | 'close';
  params!: object;
  color!: string;
  backgroundColor!: string;
}

export class Banner extends Realm.Object {
  static schema = {
    name: 'Banner',
    properties: {
      id: 'string',
      type: 'string',
      title: 'string',
      description: 'string?',
      buttons: {
        type: 'list',
        objectType: 'BannerButton',
      },
      isUsed: {type: 'bool', default: false},
      snoozedUntil: 'date?',
      titleColor: 'string?',
      descriptionColor: 'string?',
      backgroundColorFrom: 'string?',
      backgroundColorTo: 'string?',
    },
    primaryKey: 'id',
  };
  id!: string;
  type!: 'claimCode';
  title!: string;
  description: string;
  buttons: BannerButton[];
  titleColor: string;
  descriptionColor: string;
  backgroundColorFrom: string;
  backgroundColorTo: string;
  isUsed: boolean;
  snoozedUntil: Date;

  static create(
    params: Omit<Partial<Banner>, 'buttons'> & {
      id: string;
      buttons: Array<Partial<BannerButton>>;
    },
  ) {
    const exists = Banner.getById(params.id);
    if (!exists) {
      realm.write(() => {
        realm.create(Banner.schema.name, params);
      });
    }
    return params.id;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<Banner>(Banner.schema.name, id);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<Banner>(Banner.schema.name);
  }

  static getAvailable() {
    return Banner.getAll().filtered('isUsed = false');
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<Banner>(Banner.schema.name, id);
  }

  update(params: Omit<Partial<Banner>, 'id'>) {
    realm.write(() => {
      realm.create(
        Banner.schema.name,
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
