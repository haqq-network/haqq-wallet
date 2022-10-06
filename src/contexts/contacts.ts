import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';

import {realm} from '../models';
import {Contact} from '../models/contact';

class Contacts extends EventEmitter {
  async init(): Promise<void> {}

  getContacts() {
    return realm.objects<Contact>('Contact');
  }

  createContact(address: string, name: string) {
    realm.write(() => {
      realm.create('Contact', {
        account: address,
        name: name,
      });

      this.emit('contacts');
    });
  }

  updateContact(address: string, name: string) {
    const contact = this.getContact(address);
    if (contact) {
      realm.write(() => {
        contact.name = name;
      });

      this.emit('contacts');
    }
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

export function useContacts() {
  const context = useContext(ContactsContext);

  return context;
}
