import {makeAutoObservable, when} from 'mobx';
import {isHydrated, makePersistable} from 'mobx-persist-store';

import {awaitForRealm} from '@app/helpers/await-for-realm';
import {realm} from '@app/models';
import {ContactRealmObject} from '@app/models/realm-object-for-migration';
import {storage} from '@app/services/mmkv';
import {MobXStoreFromRealm} from '@app/types';
import {STORE_REHYDRATION_TIMEOUT_MS} from '@app/variables/common';

export enum ContactType {
  address = 'address',
  contract = 'contract',
}

export type Contact = {
  account: string;
  name: string;
  type?: ContactType;
  visible?: boolean;
};

class ContactStore implements MobXStoreFromRealm {
  realmSchemaName = ContactRealmObject.schema.name;
  contacts: Contact[] = [];

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['contacts'],
        storage: storage,
      });
    }
  }

  get isHydrated() {
    return isHydrated(this);
  }

  migrate = async () => {
    await awaitForRealm();
    await when(() => !!this.isHydrated, {
      timeout: STORE_REHYDRATION_TIMEOUT_MS,
    });

    const realmData = realm.objects<Contact>(this.realmSchemaName);
    if (realmData.length > 0) {
      realmData.forEach(item => {
        this.create(item.account, {
          name: item.name || '',
          type: item.type,
          visible: item.visible,
        });
        realm.write(() => {
          realm.delete(item);
        });
      });
    }
  };

  create(
    account: Contact['account'],
    params: Omit<Partial<Contact>, 'account'>,
  ) {
    const id = account.toLowerCase();
    const existingContact = this.getById(id);
    const newContact = {
      ...existingContact,
      ...params,
      account: id,
      name: params.name || '',
    };

    if (existingContact) {
      this.update(existingContact.account, params);
    } else {
      this.contacts.push(newContact);
    }

    return id;
  }

  remove(account: string) {
    if (!account) {
      return false;
    }
    const contactToRemove = this.getById(account);
    if (!contactToRemove) {
      return false;
    }
    this.contacts = this.contacts.filter(
      contact => contact.account !== contactToRemove.account,
    );
    return true;
  }

  getAll() {
    return this.contacts;
  }

  getById(account: string) {
    return (
      this.contacts.find(
        contact => contact.account === account.toLowerCase(),
      ) ?? null
    );
  }

  removeAll() {
    this.contacts = [];
  }

  update(
    account: Contact['account'] | undefined,
    params: Omit<Partial<Contact>, 'account'>,
  ) {
    if (!account) {
      return false;
    }
    const contactToUpdate = this.getById(account);
    if (!contactToUpdate) {
      return false;
    }
    const contactsWithoutOldValue = this.contacts.filter(
      contact => contact.account !== contactToUpdate.account,
    );
    this.contacts = [
      ...contactsWithoutOldValue,
      {...contactToUpdate, ...params},
    ];
    return true;
  }
}

const instance = new ContactStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Contact};
