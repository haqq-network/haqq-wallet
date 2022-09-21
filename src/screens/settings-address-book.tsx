import React, {useCallback, useMemo, useState} from 'react';
import {useContacts} from '../contexts/contacts';
import {FlatList, StyleSheet} from 'react-native';
import {AddressRow} from '../components/address-row';
import {AddressHeader} from '../components/address-header';
import {
  CloseCircle,
  Container,
  IconButton,
  Input,
  QRScanner,
} from '../components/ui';
import {GRAPHIC_BASE_2, GRAPHIC_GREEN_1} from '../variables';
import {CompositeScreenProps} from '@react-navigation/native';
import {utils} from 'ethers';
import {useApp} from '../contexts/app';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen =
  ({}: SettingsAddressBookScreenProps) => {
    const app = useApp();
    const [search, setSearch] = useState('');
    const contacts = useContacts();
    const contactsList = useMemo(
      () =>
        contacts
          .getContacts()
          .filter(
            contact =>
              !!`${contact.account} ${contact.name}`
                .toLowerCase()
                .match(search.toLowerCase()),
          ),
      [contacts, search],
    );

    const onPressQR = useCallback(() => {
      const subscription = (value: string) => {
        if (utils.isAddress(value.trim())) {
          setSearch(value.trim());
          app.off('address', subscription);
          app.emit('modal', null);
        }
      };

      app.on('address', subscription);

      app.emit('modal', {type: 'qr'});
    }, [app]);

    const onPressClear = useCallback(() => {
      setSearch('');
    }, []);

    return (
      <Container style={{margin: 0}}>
        <Input
          label=""
          style={page.input}
          placeholder="Search or add a contact"
          onChangeText={setSearch}
          value={search}
          multiline={true}
          rightAction={
            search === '' ? (
              <IconButton onPress={onPressQR}>
                <QRScanner color={GRAPHIC_GREEN_1} style={page.icon} />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <CloseCircle color={GRAPHIC_BASE_2} style={page.icon} />
              </IconButton>
            )
          }
        />
        <FlatList
          data={contactsList}
          renderItem={AddressRow}
          ListHeaderComponent={AddressHeader}
        />
      </Container>
    );
  };

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 10,
    gap: 10,
  },
  input: {
    marginBottom: 12,
    marginHorizontal: 20,
  },
  button: {
    marginHorizontal: 20,
  },
  icon: {width: 20, height: 20},
});
