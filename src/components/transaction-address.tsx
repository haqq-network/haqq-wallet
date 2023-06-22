import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {utils} from 'ethers';
import {Keyboard, ListRenderItem, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {ListContact} from '@app/components/list-contact';
import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconButton,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextField,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {hideModal, showModal} from '@app/helpers/modal';
import {withActionsContactItem} from '@app/hocs';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {isHexString} from '@app/utils';

import {WalletRow, WalletRowTypes} from './wallet-row';

export type TransactionAddressProps = {
  initial?: string;
  loading?: boolean;
  wallets?: Realm.Results<Wallet>;
  contacts?: Realm.Results<Contact>;
  onAddress: (address: string) => void;
};

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'transactionContactEdit',
});

export const TransactionAddress = ({
  initial = '',
  loading = false,
  wallets,
  contacts,
  onAddress,
}: TransactionAddressProps) => {
  const [address, setAddress] = useState(initial);
  const [error, setError] = useState(false);
  const checked = useMemo(() => utils.isAddress(address.trim()), [address]);
  const filteredWallets = useMemo(() => {
    if (!wallets || !wallets.length) {
      return;
    }

    if (!address) {
      return wallets.snapshot();
    }

    return wallets
      .filtered(
        `address CONTAINS[c] '${address}' or name CONTAINS[c] '${address}'`,
      )
      .snapshot();
  }, [address, wallets]);

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

  const onDone = useCallback(async () => {
    onAddress(address.trim());
  }, [onAddress, address]);

  const onPressQR = useCallback(() => {
    Keyboard.dismiss();
    const subscription = ({to}: any) => {
      if (utils.isAddress(to)) {
        setAddress(to);
        app.off('address', subscription);
        hideModal('qr');
      }
    };
    app.on('address', subscription);
    showModal('qr');
  }, []);

  const onPressClear = useCallback(() => {
    setAddress('');
  }, []);

  const onPressAddress = useCallback(
    (item: string) => {
      vibrate(HapticEffects.impactLight);
      onAddress(item);
    },
    [onAddress],
  );

  const onPressPaste = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await Clipboard.getString();
    setAddress(pasteString);
  }, []);

  const myAccountsKeyExtractor = useCallback(
    (item: Wallet) => item.address,
    [],
  );

  const myAccountsRenderItem: ListRenderItem<Wallet> = useCallback(
    ({item}) => (
      <>
        <WalletRow
          item={item}
          onPress={() => onPressAddress(item.address)}
          type={WalletRowTypes.variant4}
        />
        <Spacer width={8} />
      </>
    ),
    [onPressAddress],
  );

  return (
    <KeyboardSafeArea>
      <TextField
        label={I18N.transactionAddressLabel}
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        error={error}
        errorText={getText(I18N.transactionAddressError)}
        autoFocus
        multiline
        numberOfLines={10}
        placeholder={I18N.transactionAddressPlaceholder}
        rightAction={
          <First>
            {address === '' && (
              <View style={styles.inputButtonContainer}>
                <IconButton onPress={onPressPaste}>
                  <Icon i24 name="paste" color={Color.graphicGreen1} />
                </IconButton>
                <Spacer width={12} />
                <IconButton onPress={onPressQR}>
                  <Icon i24 name="qr_scanner" color={Color.graphicGreen1} />
                </IconButton>
              </View>
            )}
            <IconButton onPress={onPressClear}>
              <Icon i24 name="close_circle" color={Color.graphicBase2} />
            </IconButton>
          </First>
        }
      />

      {Boolean(filteredWallets?.length) && (
        <View style={styles.marginHorizontal}>
          <Text t6 i18n={I18N.transactionMyAccounts} />
          <Spacer height={12} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filteredWallets}
            keyExtractor={myAccountsKeyExtractor}
            renderItem={myAccountsRenderItem}
          />
          <Spacer height={12} />
        </View>
      )}

      {Boolean(contacts?.length) && (
        <>
          <Spacer height={12} />
          <View style={styles.marginHorizontal}>
            <Text t6 i18n={I18N.transactionMyContacts} />
          </View>
          <ListOfContacts onPressAddress={onPressAddress} />
        </>
      )}
      <Button
        disabled={!checked}
        variant={ButtonVariant.contained}
        i18n={I18N.continue}
        onPress={onDone}
        style={styles.button}
        loading={loading}
      />
      <Spacer height={32} />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  input: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  inputButtonContainer: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 20,
  },
  marginHorizontal: {
    marginHorizontal: 20,
  },
});
