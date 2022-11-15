import {useContext} from 'react';

import {ContactsContext} from '@app/contexts';

export function useContacts() {
  const context = useContext(ContactsContext);

  return context;
}
