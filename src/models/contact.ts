import {isHydrated, makePersistable} from '@override/mobx-persist-store';
import {makeAutoObservable} from 'mobx';

import {storage} from '@app/services/mmkv';

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

class ContactStore {
  contacts: Contact[] = [];

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['contacts'],
      storage,
    });
  }

  get isHydrated() {
    return isHydrated(this);
  }

  create(
    account: Contact['account'],
    params: Omit<Partial<Contact>, 'account'>,
  ) {
    const id = account;
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
    const lowerCaseAccount = account.toLowerCase();
    return (
      this.contacts.find(
        contact => contact.account.toLowerCase() === lowerCaseAccount,
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

const instance = new ContactStore();
export {instance as Contact};
