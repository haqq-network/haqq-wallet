import {GEO_WATCH_ID_KEY} from '@app/helpers/webview-geolocation';
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

  static getAll() {
    return realm.objects<VariablesString>(VariablesString.schema.name);
  }

  static setGeoWatchId(
    browserInstanceId: string,
    watchID: number,
    geolocationWatchID: number,
  ) {
    VariablesString.set(
      `${browserInstanceId}:${GEO_WATCH_ID_KEY}:${watchID}`,
      String(geolocationWatchID),
    );
  }

  static getGeoWatchId(browserInstanceId: string, watchID: number) {
    return VariablesString.get(
      `${browserInstanceId}:${GEO_WATCH_ID_KEY}:${watchID}`,
    );
  }

  static getAllGeoWatchIds(browserInstanceId: string) {
    return VariablesString.getAll().filtered(
      'id CONTAINS[c] $0 and id CONTAINS[c] $1',
      GEO_WATCH_ID_KEY,
      browserInstanceId,
    );
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
