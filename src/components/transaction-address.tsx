import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {utils} from 'ethers';
import {FlatList, StyleSheet, Text, View} from 'react-native';

import {AddressHeader} from './address-header';
import {AddressRow} from './address-row';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  KeyboardSafeArea,
  PenIcon,
  QRScanner,
  Spacer,
  SwipeableRow,
  TextField,
  TrashIcon,
} from './ui';

import {useApp} from '../contexts/app';
import {hideModal, showModal} from '../helpers/modal';
import {useAddressBookItemActions} from '../hooks/use-address-book-item-actions';
import {isHexString} from '../utils';
import {
  LIGHT_GRAPHIC_BASE_2,
  LIGHT_GRAPHIC_BASE_3,
  LIGHT_GRAPHIC_GREEN_1,
  LIGHT_GRAPHIC_RED_1,
  LIGHT_GRAPHIC_SECOND_4,
  PLACEHOLDER_GRAY,
} from '../variables';

export type TransactionAddressProps = {
  initial?: string;
  onAddress: (address: string) => void;
};

export const TransactionAddress = ({
  initial = '',
  onAddress,
}: TransactionAddressProps) => {
  const app = useApp();
  const [address, setAddress] = useState(initial);
  const [error, setError] = useState(false);
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const {goBack} = useNavigation();
  const checked = useMemo(() => utils.isAddress(address.trim()), [address]);

  const {contactsList, onPressEdit, onPressRemove} = useAddressBookItemActions(
    true,
    true,
  );

  useEffect(() => {
    const toTrim = address.trim();

    if (toTrim.length >= 2 && !toTrim.startsWith('0x')) {
      return setError(true);
    }

    if (toTrim.length > 2 && !isHexString(toTrim)) {
      return setError(true);
    }

    if (toTrim.length < 42) {
      return setError(false);
    }

    if (!utils.isAddress(toTrim.trim())) {
      return setError(true);
    }

    setError(false);
  }, [address]);

  const handleFocusInput = () => setInputIsFocused(true);
  const handleBlurInput = () => setInputIsFocused(false);

  const onDone = useCallback(async () => {
    onAddress(address.trim());
  }, [onAddress, address]);

  const onPressQR = useCallback(() => {
    const subscriptionBack = () => {
      goBack();
      app.off('onCloseQr', subscriptionBack);
    };
    const subscription = ({to}: any) => {
      if (utils.isAddress(to)) {
        setAddress(to);
        app.off('address', subscription);
        app.off('onCloseQr', subscriptionBack);
        hideModal();
      }
    };
    app.on('address', subscription);

    app.on('onCloseQr', subscriptionBack);
    showModal('qr');
  }, [app, goBack]);

  const onPressClear = useCallback(() => setAddress(''), []);

  return (
    <KeyboardSafeArea>
      <View>
        <TextField
          onFocus={handleFocusInput}
          onBlur={handleBlurInput}
          label="Send to"
          style={page.input}
          value={address}
          onChangeText={setAddress}
          error={error}
          errorText="Incorrect address"
          autoFocus
          multiline
          rightAction={
            address === '' ? (
              <IconButton onPress={onPressQR}>
                <QRScanner
                  color={LIGHT_GRAPHIC_GREEN_1}
                  width={25}
                  height={25}
                />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <Icon s name="closeCircle" color={LIGHT_GRAPHIC_BASE_2} />
              </IconButton>
            )
          }
        />
        {!address && inputIsFocused ? (
          <Text style={page.placeholder}>Enter Address or contact name</Text>
        ) : null}
      </View>
      <Spacer>
        {contactsList.length ? (
          <FlatList
            keyboardShouldPersistTaps="always"
            data={contactsList}
            renderItem={({item}) => (
              <SwipeableRow
                item={item}
                rightActions={[
                  {
                    icon: <PenIcon color={LIGHT_GRAPHIC_BASE_3} />,
                    backgroundColor: LIGHT_GRAPHIC_SECOND_4,
                    onPress: onPressEdit,
                    key: 'edit',
                  },
                  {
                    icon: <TrashIcon color={LIGHT_GRAPHIC_BASE_3} />,
                    backgroundColor: LIGHT_GRAPHIC_RED_1,
                    onPress: onPressRemove,
                    key: 'remove',
                  },
                ]}>
                <AddressRow item={item} />
              </SwipeableRow>
            )}
            ListHeaderComponent={AddressHeader}
          />
        ) : null}
      </Spacer>

      <Button
        disabled={!checked}
        variant={ButtonVariant.contained}
        title="Continue"
        onPress={onDone}
        style={page.button}
      />
    </KeyboardSafeArea>
  );
};

const page = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    color: PLACEHOLDER_GRAY,
    left: 37,
    bottom: 21,
  },
  input: {
    marginBottom: 12,
    marginHorizontal: 20,
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
});
