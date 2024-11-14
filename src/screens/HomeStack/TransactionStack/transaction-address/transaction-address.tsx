import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {NetworkProviderTypes} from '@app/services/backend';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {TransactionAddressAddContact} from './transaction-address-add-contact';
import {TransactionAddressContactList} from './transaction-address-contact-list';
import {TransactionAddressInput} from './transaction-address-input';
import {TransactionAddressWalletList} from './transaction-address-wallet-list';

import {TransactionStore} from '../transaction-store';

const logger = Logger.create('TransactionAddressScreen');
const testID = 'transaction_address';

export const TransactionAddressScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const toAddress = TransactionStore.to?.address;
  const fromAddress = TransactionStore.from?.address;

  const {bottom: safeAreaBottomInset} = useSafeAreaInsets();

  const [isError, setIsError] = useState(false);

  const fromWallet = useMemo(() => Wallet.getById(fromAddress)!, [fromAddress]);

  const [loading, setLoading] = React.useState(false);

  const filteredWallets = useMemo(() => {
    const wallets = Wallet.getAllVisible();

    if (!wallets?.length) {
      return [];
    }
    const isTron = Provider.selectedProvider.isTron;

    if (!toAddress && fromAddress) {
      return wallets.filter(w => {
        if (isTron && !w.isSupportTron) {
          return false;
        }
        return !AddressUtils.equals(w.address, fromAddress);
      });
    }

    const lowerCaseAddress = toAddress!.toLowerCase();

    return wallets.filter(w => {
      if (isTron && !w.isSupportTron) {
        return false;
      }
      return (
        (w.address.toLowerCase().includes(lowerCaseAddress) ||
          w.tronAddress?.toLowerCase?.()?.includes?.(lowerCaseAddress) ||
          w.cosmosAddress.toLowerCase().includes(lowerCaseAddress) ||
          w.name.toLowerCase().includes(lowerCaseAddress)) &&
        !AddressUtils.equals(w.address, fromAddress)
      );
    });
  }, [toAddress, fromAddress]);

  const filteredContacts = useMemo(() => {
    const contacts = Contact.getAll();

    if (!contacts?.length) {
      return [];
    }

    if (!toAddress) {
      return contacts.filter(c => !AddressUtils.equals(c.account, fromAddress));
    }

    const lowerCaseAddress = toAddress.toLowerCase();

    return contacts.filter(c => {
      const hexAddress = AddressUtils.toEth(c.account);
      const haqqAddress = AddressUtils.toHaqq(hexAddress);

      return (
        (hexAddress.includes(lowerCaseAddress) ||
          haqqAddress.includes(lowerCaseAddress) ||
          c.name?.toLowerCase().includes(lowerCaseAddress)) &&
        !AddressUtils.equals(hexAddress, fromAddress)
      );
    });
  }, [toAddress, fromAddress]);

  const onDone = useCallback(
    async (result: string) => {
      try {
        const networkType = Provider.selectedProvider.isTron
          ? NetworkProviderTypes.TRON
          : NetworkProviderTypes.EVM;
        const converter = AddressUtils.getConverterByNetwork(networkType);
        setLoading(true);
        if (nft) {
          return navigation.navigate(
            TransactionStackRoutes.TransactionNftConfirmation,
            {
              from: converter(from),
              to: converter(result),
              nft,
            },
          );
        } else if (token) {
          return navigation.navigate(TransactionStackRoutes.TransactionSum, {
            from: converter(from),
            to: converter(result),
            token,
          });
        } else {
          navigation.navigate(TransactionStackRoutes.TransactionSelectCrypto, {
            from: converter(fromAddress),
            to: converter(result),
          });
        }
      } catch (e) {
        logger.error('onDone', e);
      } finally {
        setLoading(false);
      }
    },
    [navigation, /* nft, token, */ fromAddress],
  );

  const doneDisabled = useMemo(() => {
    if (!address?.trim() || isError) {
      return true;
    }

    if (Provider.selectedProvider.isTron) {
      return (
        // can't send to the same wallet
        fromWallet.tronAddress?.toLowerCase() === address?.toLowerCase() ||
        !AddressUtils.isTronAddress(address)
      );
    }
    return (
      fromWallet.address?.toLowerCase() === address?.toLowerCase() ||
      fromWallet.cosmosAddress?.toLowerCase() === address?.toLowerCase() ||
      !AddressUtils.isValidAddress(address)
    );
  }, [isError, address, fromWallet]);

  const onPressAddress = useCallback(
    (item: string) => {
      vibrate(HapticEffects.impactLight);
      onDone(item);
    },
    [onDone],
  );

  const onPressButton = useCallback(() => {
    onDone(address.trim());
  }, [address, onDone]);

  return (
    <KeyboardSafeArea style={styles.keyboardAvoidingView}>
      <TransactionAddressInput
        testID={testID}
        address={address}
        setAddress={setAddress}
        isError={isError}
        setIsError={setIsError}
        onDone={onDone}
      />
      {Boolean(filteredWallets.length) && (
        <TransactionAddressWalletList
          wallets={filteredWallets}
          onPress={onPressAddress}
        />
      )}
      {Boolean(filteredContacts.length) && (
        <TransactionAddressContactList
          contacts={filteredContacts}
          onPress={onPressAddress}
        />
      )}
      {AddressUtils.isValidAddress(address) && !filteredContacts.length && (
        <TransactionAddressAddContact address={address} />
      )}
      <Spacer flex={1} />
      <Button
        disabled={doneDisabled}
        variant={ButtonVariant.contained}
        i18n={I18N.continue}
        onPress={onPressButton}
        loading={loading}
        testID={`${testID}_next`}
      />
      <Spacer height={safeAreaBottomInset} />
    </KeyboardSafeArea>
  );
});

const styles = createTheme({
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
