import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {utils} from 'ethers';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  CloseCircle,
  IconButton,
  Input,
  QRScanner,
} from '../components/ui';
import {Container} from '../components/container';
import {Spacer} from '../components/spacer';
import {useContacts} from '../contexts/contacts';
import {AddressRow} from '../components/address-row';
import {useApp} from '../contexts/app';
import {AddressHeader} from '../components/address-header';
import {GRAPHIC_BASE_2, GRAPHIC_GREEN_1} from '../variables';

type TransactionAddressScreenProp = CompositeScreenProps<any, any>;

export const TransactionAddressScreen = ({
  route,
  navigation,
}: TransactionAddressScreenProp) => {
  console.log('route', route);
  const app = useApp();
  const contacts = useContacts();
  const [to, setTo] = useState('');
  const contactsList = contacts.getContacts();
  const checked = useMemo(() => utils.isAddress(to.trim()), [to]);

  useEffect(() => {
    const subscription = (value: string) => {
      if (utils.isAddress(value.trim())) {
        setTo(value.trim());
      }
    };
    app.on('address', subscription);

    return () => {
      app.off('address', subscription);
    };
  }, [app]);

  const onDone = useCallback(async () => {
    navigation.navigate('transactionSum', {
      from: route.params.from,
      to: to.trim(),
    });
  }, [navigation, route.params.from, to]);

  const onPressQR = useCallback(() => {
    navigation.navigate('transactionQR', {
      key: route.key,
    });
  }, [navigation, route.key]);

  const onPressClear = useCallback(() => {
    setTo('');
  }, []);

  return (
    <Container>
      <Input
        label="Send to"
        style={page.input}
        placeholder="Enter Address or contact name"
        onChangeText={setTo}
        value={to}
        multiline={true}
        rightAction={
          to === '' ? (
            <IconButton onPress={onPressQR}>
              <QRScanner
                color={GRAPHIC_GREEN_1}
                style={{width: 20, height: 20}}
              />
            </IconButton>
          ) : (
            <IconButton onPress={onPressClear}>
              <CloseCircle
                color={GRAPHIC_BASE_2}
                style={{width: 20, height: 20}}
              />
            </IconButton>
          )
        }
      />
      <Spacer>
        {contactsList && (
          <FlatList
            data={contactsList}
            renderItem={AddressRow}
            ListHeaderComponent={AddressHeader}
          />
        )}
      </Spacer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{height: 70}}>
        <Button
          disabled={!checked}
          variant={ButtonVariant.contained}
          title="Continue"
          onPress={onDone}
        />
      </KeyboardAvoidingView>
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
  input: {},
});
