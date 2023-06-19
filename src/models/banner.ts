import {Color} from '@app/colors';
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
  event!:
    | 'claimCode'
    | 'close'
    | 'notificationsTurnOn'
    | 'notificationsTopicSubscribe';
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
      closeButtonColor: 'string?',
      backgroundColorFrom: 'string?',
      backgroundColorTo: 'string?',
      backgroundBorder: 'string?',
      backgroundImage: 'string?',
      defaultEvent: 'string?',
      defaultParams: 'string{}',
      closeEvent: 'string?',
      closeParams: 'string{}',
      priority: {type: 'double', default: 0},
    },
    primaryKey: 'id',
  };
  id!: string;
  type!: 'claimCode' | 'notifications' | 'notificationsTopic' | 'trackActivity';
  title!: string;
  description: string;
  buttons: BannerButton[];
  titleColor: string | Color;
  descriptionColor: string | Color;
  backgroundColorFrom: string;
  backgroundColorTo: string;
  backgroundImage: string;
  backgroundBorder: string | Color;
  closeButtonColor: string | Color;
  isUsed: boolean;
  snoozedUntil: Date;
  defaultEvent: string;
  defaultParams: object;
  closeEvent: string;
  closeParams: object;
  priority: number;

  static create(
    params: Omit<Partial<Banner>, 'buttons'> & {
      id: string;
      buttons?: Array<Partial<BannerButton>>;
    },
  ) {
    const exists = Banner.getById(params.id);

    const buttons = exists ? exists.buttons : [];

    realm.write(() => {
      realm.create(
        Banner.schema.name,
        {
          ...exists?.toJSON(),
          ...params,
          buttons: params.buttons || buttons,
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

  static removeAll() {
    const items = Banner.getAll();

    for (const item of items) {
      realm.write(() => {
        realm.delete(item);
      });
    }
  }

  static getAll() {
    return realm.objects<Banner>(Banner.schema.name);
  }

  static getAvailable() {
    return Banner.getAll().filtered('isUsed = false').sorted('priority', true);
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
