import {realm} from '@app/models';

export class VariablesDate extends Realm.Object {
  static schema = {
    name: 'VariablesDate',
    properties: {
      id: 'string',
      value: 'date',
    },
    primaryKey: 'id',
  };
  id!: string;
  value!: Date;

  static set(id: string, value: Date) {
    realm.write(() => {
      realm.create<VariablesDate>(
        VariablesDate.schema.name,
        {
          id,
          value,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return id;
  }

  static exists(id: string): boolean {
    return !!realm.objectForPrimaryKey<VariablesDate>(
      VariablesDate.schema.name,
      id,
    );
  }

  static get(id: string) {
    return realm.objectForPrimaryKey<VariablesDate>(
      VariablesDate.schema.name,
      id,
    )?.value;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<VariablesDate>(
      VariablesDate.schema.name,
      id,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<VariablesDate>(
      VariablesDate.schema.name,
      id,
    );
  }
}
