import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
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
  const app = useApp();
  const contacts = useContacts();
  const [to, setTo] = useState(route.params.to ?? '');
  const contactsList = contacts.getContacts();
  const checked = useMemo(() => utils.isAddress(to.trim()), [to]);

  const onDone = useCallback(async () => {
    navigation.navigate('transactionSum', {
      from: route.params.from,
      to: to.trim(),
    });
  }, [navigation, route.params.from, to]);

  const onPressQR = useCallback(() => {
    const subscription = (value: string) => {
      if (utils.isAddress(value.trim())) {
        setTo(value.trim());
        app.off('address', subscription);
        app.emit('modal', null);
      }
    };

    app.on('address', subscription);

    app.emit('modal', {type: 'qr'});
  }, [app]);

  const onPressClear = useCallback(() => {
    setTo('');
  }, []);

  return (
    <View style={{flex: 1}}>
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
              <QRScanner color={GRAPHIC_GREEN_1} width={20} height={20} />
            </IconButton>
          ) : (
            <IconButton onPress={onPressClear}>
              <CloseCircle color={GRAPHIC_BASE_2} width={20} height={20} />
            </IconButton>
          )
        }
      />
      <Spacer>
        {contactsList.length ? (
          <FlatList
            data={contactsList}
            renderItem={AddressRow}
            ListHeaderComponent={AddressHeader}
          />
        ) : null}
      </Spacer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{height: 70, marginBottom: 40}}>
        <Button
          disabled={!checked}
          variant={ButtonVariant.contained}
          title="Continue"
          onPress={onDone}
          style={page.button}
        />
      </KeyboardAvoidingView>
    </View>
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
});
