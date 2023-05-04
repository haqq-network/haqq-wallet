import {realm} from '@app/models';

export class VariablesBool extends Realm.Object {
  static schema = {
    name: 'VariablesBool',
    properties: {
      id: 'string',
      value: 'bool',
    },
    primaryKey: 'id',
  };
  id!: string;
  value!: boolean;

  static set(id: string, value: boolean) {
    realm.write(() => {
      realm.create<VariablesBool>(
        VariablesBool.schema.name,
        {
          id,
          value,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return id;
  }

  static get(id: string): boolean {
    return (
      realm.objectForPrimaryKey<VariablesBool>(VariablesBool.schema.name, id)
        ?.value || false
    );
  }

  static exists(id: string): boolean {
    return !!realm.objectForPrimaryKey<VariablesBool>(
      VariablesBool.schema.name,
      id,
    );
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<VariablesBool>(
      VariablesBool.schema.name,
      id,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<VariablesBool>(
      VariablesBool.schema.name,
      id,
    );
  }
}
