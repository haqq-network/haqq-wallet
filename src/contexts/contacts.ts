import {createContext} from 'react';

import {EventEmitter} from 'events';

import {realm} from '../models';
import {Contact} from '../models/contact';

class Contacts extends EventEmitter {
  private _contacts: Realm.Results<Contact>;

  constructor() {
    super();

    this._contacts = realm.objects<Contact>('Contact');

    this._contacts.addListener(() => {
      this.emit('contacts');
    });
  }

  async init(): Promise<void> {}

  getContacts() {
    return realm.objects<Contact>('Contact');
  }

  removeContact(address: string) {
    const contact = this.getContact(address);

    if (contact) {
      realm.write(() => {
        realm.delete(contact);
      });

      this.emit('contacts');
    }
  }

  getContact(address: string): Contact | null {
    const contacts = realm.objects<Contact>('Contact');
    const contact = contacts.filtered(`account = '${address}'`);

    if (!contact.length) {
      return null;
    }

    return contact[0];
  }

  clean() {
    const contacts = realm.objects<Contact>('Contact');

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
  }
}

export const contacts = new Contacts();

export const ContactsContext = createContext(contacts);
