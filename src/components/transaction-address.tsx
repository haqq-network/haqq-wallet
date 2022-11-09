import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useApp} from '../contexts/app';
import {utils} from 'ethers';
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
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {
  GRAPHIC_BASE_2,
  GRAPHIC_BASE_3,
  GRAPHIC_GREEN_1,
  GRAPHIC_RED_1,
  GRAPHIC_SECOND_4,
  PLACEHOLDER_GRAY,
} from '../variables';
import {AddressRow} from './address-row';
import {AddressHeader} from './address-header';
import {isHexString} from '../utils';
import {hideModal, showModal} from '../helpers/modal';
import {useAddressBookItemActions} from '../hooks/use-address-book-item-actions';
import {useNavigation} from '@react-navigation/native';

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
    const subscription = ({to}: any) => {
      if (utils.isAddress(to)) {
        setAddress(to);
        app.off('address', subscription);
        hideModal();
      }
    };

    app.on('address', subscription);

    showModal('qr');
    goBack();
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
                <QRScanner color={GRAPHIC_GREEN_1} width={25} height={25} />
              </IconButton>
            ) : (
              <IconButton onPress={onPressClear}>
                <Icon s name="closeCircle" color={GRAPHIC_BASE_2} />
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
                    icon: <PenIcon color={GRAPHIC_BASE_3} />,
                    backgroundColor: GRAPHIC_SECOND_4,
                    onPress: onPressEdit,
                    key: 'edit',
                  },
                  {
                    icon: <TrashIcon color={GRAPHIC_BASE_3} />,
                    backgroundColor: GRAPHIC_RED_1,
                    onPress: onPressRemove,
                    key: 'remove',
                  },
                ]}>
                <AddressRow item={item} onPress={() => {}} />
              </SwipeableRow>
              // <AddressRow item={item} onPress={setAddress} />
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
