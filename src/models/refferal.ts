import {realm} from '@app/models/index';

export class Refferal extends Realm.Object {
  static schema = {
    name: 'Refferal',
    properties: {
      code: 'string',
      isUsed: {type: 'bool', default: false},
      snoozedUntil: 'date?',
    },
    primaryKey: 'code',
  };
  code!: string;
  isUsed!: boolean;
  snoozedUntil: Date;

  static create(params: Partial<Refferal> & {code: string}) {
    const exists = Refferal.getById(params.code);
    if (!exists) {
      realm.write(() => {
        realm.create(Refferal.schema.name, params);
      });
    }
    return params.code;
  }

  static remove(code: string) {
    const obj = realm.objectForPrimaryKey<Refferal>(Refferal.schema.name, code);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static removeAll() {
    const items = Refferal.getAll();

    for (const item of items) {
      realm.write(() => {
        realm.delete(item);
      });
    }
  }

  static getAll() {
    return realm.objects<Refferal>(Refferal.schema.name);
  }

  static getById(code: string) {
    return realm.objectForPrimaryKey<Refferal>(Refferal.schema.name, code);
  }

  update(params: Partial<Refferal>) {
    realm.write(() => {
      realm.create(
        Refferal.schema.name,
        {
          ...this.toJSON(),
          ...params,
          code: this.code,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
