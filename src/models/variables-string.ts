import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {awaitForRealm} from '@app/helpers/await-for-realm';
import {GEO_WATCH_ID_KEY} from '@app/helpers/webview-geolocation';
import {realm} from '@app/models';
import {VariablesStringRealmObject} from '@app/models/realm-object-for-migration';
import {storage} from '@app/services/mmkv';
import {MobXStoreFromRealm} from '@app/types';
import {isValidJSON} from '@app/utils';
import {STORE_REHYDRATION_TIMEOUT_MS} from '@app/variables/common';

export type VariableString = {
  id: string;
  value: string;
};

export class VariableStringStore implements MobXStoreFromRealm {
  realmSchemaName = VariablesStringRealmObject.schema.name;
  variables: Map<string, string> = new Map();

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);

    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['variables'],
        storage: storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  migrate = async () => {
    await awaitForRealm();
    await when(() => this.isHydrated, {
      timeout: STORE_REHYDRATION_TIMEOUT_MS,
    });

    const realmData = realm.objects<VariableString>(this.realmSchemaName);
    if (realmData.length > 0) {
      realmData.forEach(item => {
        this.set(item.id, item.value);
        realm.write(() => {
          realm.delete(item);
        });
      });
    }
  };

  set(id: string, value: string) {
    this.variables.set(id, value);
  }

  setObject(id: string, value: any) {
    if (isValidJSON(value)) {
      this.variables.set(id, JSON.stringify(value));
      return true;
    }
    return false;
  }

  get(id: string) {
    return this.variables.get(id);
  }

  getObject<T = {}>(id: string) {
    const value = this.variables.get(id);
    if (isValidJSON(value)) {
      return JSON.parse(value) as T;
    }
    return null;
  }

  getAll() {
    return Array.from(this.variables.entries());
  }

  exists(id: string) {
    return this.variables.has(id);
  }

  remove(id: string) {
    this.variables.delete(id);
  }

  setGeoWatchId(
    browserInstanceId: string,
    watchID: number,
    geolocationWatchID: number,
  ) {
    this.variables.set(
      `${browserInstanceId}:${GEO_WATCH_ID_KEY}:${watchID}`,
      String(geolocationWatchID),
    );
  }

  getGeoWatchId(browserInstanceId: string, watchID: number) {
    return this.variables.get(
      `${browserInstanceId}:${GEO_WATCH_ID_KEY}:${watchID}`,
    );
  }

  getAllGeoWatchIds(browserInstanceId: string) {
    return this.getAll().filter(item => {
      const id = item[0].split(':');
      return (
        id[0].toLowerCase() === browserInstanceId.toLowerCase() &&
        id[1].toLowerCase() === GEO_WATCH_ID_KEY.toLowerCase()
      );
    });
  }
}

const instance = new VariableStringStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as VariableString};
