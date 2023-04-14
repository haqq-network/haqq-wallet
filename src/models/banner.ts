import {realm} from '@app/models/index';

import UUID = Realm.BSON.UUID;

export class BannerButton extends Realm.Object {
  static schema = {
    name: 'BannerButton',
    properties: {
      id: 'uuid',
      title: 'string',
      event: 'string',
      params: 'string{}',
      color: 'string',
      backgroundColor: 'string',
    },
  };
  id!: UUID;
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
      backgroundImage: 'string?',
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
  backgroundImage: string;
  isUsed: boolean;
  snoozedUntil: Date;

  static create(
    params: Omit<Partial<Banner>, 'buttons'> & {
      id: string;
      buttons: Array<Partial<BannerButton>>;
    },
  ) {
    const exists = Banner.getById(params.id);
    realm.write(() => {
      realm.create(
        Banner.schema.name,
        {
          ...exists?.toJSON(),
          ...params,
        },
        Realm.UpdateMode.Modified,
      );
    });
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
