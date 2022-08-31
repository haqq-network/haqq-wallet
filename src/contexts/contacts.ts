import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';

import {realm} from '../models';
import {ContactType} from '../models/contact';

class Contacts extends EventEmitter {
  async init(): Promise<void> {}

  getContacts() {
    return realm.objects<ContactType>('Contact');
  }

  createContact(address: string, name: string) {
    realm.write(() => {
      realm.create('Contact', {
        account: address,
        name: name,
      });
    });
  }

  updateContact(address: string, name: string) {
    const contact = this.getContact(address);
    if (contact) {
      realm.write(() => {
        contact.name = name;
      });
    }
  }

  getContact(address: string): ContactType | null {
    const contacts = realm.objects<ContactType>('Contact');
    const contact = contacts.filtered(`account = '${address}'`);

    if (!contact.length) {
      return null;
    }

    return contact[0];
  }
}

export const contacts = new Contacts();

export const ContactsContext = createContext(contacts);

export function useContacts() {
  const context = useContext(ContactsContext);

  return context;
}
