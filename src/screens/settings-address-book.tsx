import React, {useCallback, useMemo, useState} from 'react';
import {useContacts} from '../contexts/contacts';
import {FlatList, StyleSheet} from 'react-native';
import {AddressRow} from '../components/address-row';
import {AddressHeader} from '../components/address-header';
import {CloseCircle, IconButton, Input, QRScanner} from '../components/ui';
import {GRAPHIC_BASE_2, GRAPHIC_GREEN_1} from '../variables';
import {Container} from '../components/container';
import {CompositeScreenProps} from '@react-navigation/native';

type SettingsAddressBookScreenProps = CompositeScreenProps<any, any>;

export const SettingsAddressBookScreen = ({
  navigation,
  route,
}: SettingsAddressBookScreenProps) => {
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
    navigation.navigate('transactionQR', {
      key: route.key,
    });
  }, [navigation, route.key]);

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
