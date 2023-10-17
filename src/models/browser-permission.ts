import {makeAutoObservable, toJS} from 'mobx';
import {makePersistable} from 'mobx-persist-store';
import {Alert} from 'react-native';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {storage} from '@app/services/mmkv';
import {
  BrowserPermissionItem,
  BrowserPermissionStatus,
  BrowserPermissionType,
  PartialRequired,
} from '@app/types';

type PermissionMap = Record<BrowserPermissionType, BrowserPermissionItem>;
type Hostname = string;

class BrowserPermissionStore {
  /**
   * @example
   * {
   *   [Hostname]: {
   *      [BrowserPermissionType]: BrowserPermissionItem,
   *   }
   * }
   */
  private _data: Record<Hostname, PermissionMap> = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        // @ts-ignore
        properties: ['_data'],
        storage: storage,
      });
    }
  }

  get data() {
    return toJS(this._data);
  }

  create(
    hostname: string,
    params: Omit<BrowserPermissionItem, 'id' | 'createdAt' | 'lastUsedAt'>,
  ) {
    if (!hostname) {
      return false;
    }
    const id = hostname.toLowerCase();
    const existingPermissionMap = this.getByHostname(hostname);
    const existingPermissionItem = this.getByHostnameAndType(
      hostname,
      params.type,
    );

    const newPermissionItem: BrowserPermissionItem = {
      ...existingPermissionItem,
      ...params,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      id,
    };

    if (existingPermissionItem) {
      this.update(hostname, params);
    } else {
      this._data[id] = {
        ...existingPermissionMap,
        [params.type]: newPermissionItem,
      };
    }
    return id;
  }

  remove(hostname: string) {
    if (!hostname) {
      return false;
    }
    const id = hostname.toLowerCase();
    const dataToRemove = this.getByHostname(id);
    if (!dataToRemove) {
      return false;
    }
    delete this._data[id];
    return true;
  }

  getAll() {
    return Object.values(this.data);
  }

  getByHostname(hostname: string) {
    const id = hostname.toLowerCase();
    return this.data[id.toLowerCase()];
  }

  getByHostnameAndType(hostname: string, type: BrowserPermissionType) {
    const item = this.getByHostname(hostname) || {};
    return item[type];
  }

  removeAll() {
    this._data = {};
  }

  update(
    hostname: string,
    params: PartialRequired<BrowserPermissionItem, 'type'>,
  ) {
    if (!hostname) {
      return false;
    }
    const id = hostname.toLowerCase();

    const dataToUpdate = this.getByHostname(id);
    const permissionItemToUpdate = this.getByHostnameAndType(
      hostname,
      params.type,
    );

    if (!dataToUpdate) {
      return false;
    }

    this._data[id] = {
      ...dataToUpdate,
      [params.type]: {
        ...permissionItemToUpdate,
        ...params,
      },
    };
    return true;
  }

  checkPermission = (
    hostname: string,
    type: BrowserPermissionType,
  ): boolean => {
    const permission = BrowserPermission.getByHostnameAndType(
      hostname.toLowerCase(),
      type,
    );

    if (permission) {
      switch (permission.status) {
        case BrowserPermissionStatus.allow:
          return true;
        case BrowserPermissionStatus.allowOnce:
          if (permission.lastUsedAt > app.startUpTime) {
            return true;
          }
          return false;
        case BrowserPermissionStatus.deny:
          return false;
      }
    }

    return false;
  };

  showPermissionPropmt = async (
    hostname: string,
    title: I18N,
    message: I18N,
  ) => {
    return new Promise<BrowserPermissionStatus>(resolve => {
      Alert.alert(getText(title, {hostname}), getText(message, {hostname}), [
        {
          text: getText(I18N.browserPermissionPromptAllow),
          onPress: () => resolve(BrowserPermissionStatus.allow),
        },
        {
          text: getText(I18N.browserPermissionPromptAllowOnce),
          onPress: () => resolve(BrowserPermissionStatus.allowOnce),
        },
        {
          text: getText(I18N.browserPermissionPromptDeny),
          onPress: () => resolve(BrowserPermissionStatus.deny),
        },
      ]);
    });
  };
}

export const BrowserPermission = new BrowserPermissionStore();
