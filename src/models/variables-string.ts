import {realm} from '@app/models';

export class VariablesString extends Realm.Object {
  static schema = {
    name: 'VariablesString',
    properties: {
      id: 'string',
      value: 'string',
    },
    primaryKey: 'id',
  };
  id!: string;
  value!: string;

  static set(id: string, value: string) {
    realm.write(() => {
      realm.create<VariablesString>(
        VariablesString.schema.name,
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
    return !!realm.objectForPrimaryKey<VariablesString>(
      VariablesString.schema.name,
      id,
    );
  }

  static get(id: string) {
    return realm.objectForPrimaryKey<VariablesString>(
      VariablesString.schema.name,
      id,
    )?.value;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<VariablesString>(
      VariablesString.schema.name,
      id,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<VariablesString>(
      VariablesString.schema.name,
      id,
    );
  }
}
