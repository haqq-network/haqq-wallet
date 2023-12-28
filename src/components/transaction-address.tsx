import React, {useCallback, useState} from 'react';

import {ListRenderItem, View} from 'react-native';
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
  PopupContainer,
  Spacer,
  Text,
  TextField,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForScanQr} from '@app/helpers/await-for-scan-qr';
import {LinkType} from '@app/helpers/parse-deep-link';
import {withActionsContactItem} from '@app/hocs';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {SystemDialog} from '@app/services/system-dialog';
import {showUnrecognizedDataAttention} from '@app/utils';

import {WalletRow, WalletRowTypes} from './wallet-row';
import {WALLET_ROW_4_WIDTH} from './wallet-row-variant-4';

export type TransactionAddressProps = {
  testID?: string;
  initial?: string;
  loading?: boolean;
  filteredWallets?: Wallet[];
  contacts?: Contact[];
  address: string;
  onAddress: (address: string) => void;
  setAddress: (address: string) => void;
};

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'transactionContactEdit',
});

export const TransactionAddress = ({
  loading = false,
  address,
  setAddress,
  filteredWallets,
  contacts,
  onAddress,
  testID,
}: TransactionAddressProps) => {
  const [error, setError] = useState(false);
  const onDone = useCallback(async () => {
    onAddress(address.trim());
  }, [onAddress, address]);

  const onPressQR = useCallback(async () => {
    const {type, params} = await awaitForScanQr();

    switch (type) {
      case LinkType.Haqq:
      case LinkType.Address:
      case LinkType.Etherium:
        setAddress(params.address ?? '');
        break;
      default:
        setError(true);
        showUnrecognizedDataAttention();
        break;
    }
  }, [setAddress]);

  const onPressClear = useCallback(() => {
    setAddress('');
  }, [setAddress]);

  const onPressAddress = useCallback(
    (item: string) => {
      vibrate(HapticEffects.impactLight);
      onAddress(item);
    },
    [onAddress],
  );

  const onPressPaste = useCallback(async () => {
    vibrate(HapticEffects.impactLight);
    const pasteString = await SystemDialog.getClipboardString();
    setAddress(pasteString);
  }, [setAddress]);

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

  const handleChangeAddress = useCallback((value: string) => {
    const nextValue = value.trim();
    setAddress(nextValue);
    const isValidAddress = AddressUtils.isValidAddress(nextValue);
    setError(!isValidAddress);
  }, []);

  return (
    <PopupContainer testID={testID}>
      <KeyboardSafeArea style={styles.keyboardSafeArea}>
        <TextField
          label={I18N.transactionAddressLabel}
          style={styles.input}
          value={address}
          onChangeText={handleChangeAddress}
          error={error}
          errorText={getText(I18N.transactionAddressError)}
          autoFocus
          multiline
          numberOfLines={10}
          placeholder={I18N.transactionAddressPlaceholder}
          testID={`${testID}_input`}
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
              snapToInterval={WALLET_ROW_4_WIDTH}
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
        <Spacer flex={1} />
        <Button
          disabled={error}
          variant={ButtonVariant.contained}
          i18n={I18N.continue}
          onPress={onDone}
          style={styles.button}
          loading={loading}
          testID={`${testID}_next`}
        />
        <Spacer height={20} />
      </KeyboardSafeArea>
    </PopupContainer>
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
  keyboardSafeArea: {
    flex: 1,
  },
});
