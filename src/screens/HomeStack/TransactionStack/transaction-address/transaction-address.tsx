import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {NetworkProviderTypes} from '@app/services/backend';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {TransactionAddressContactList} from './transaction-address-contact-list';
import {TransactionAddressInput} from './transaction-address-input';
import {TransactionAddressNetwork} from './transaction-address-network';
import {TransactionAddressWalletList} from './transaction-address-wallet-list';

import {TransactionStore} from '../transaction-store';

const logger = Logger.create('TransactionAddressScreen');
const testID = 'transaction_address';

export const TransactionAddressScreen = observer(() => {
  const {nft, token} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionAddress
  >().params;
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  const {toAddress, fromAddress, toChainId} = TransactionStore;

  const {bottom: safeAreaBottomInset} = useSafeAreaInsets();

  const [isError, setIsError] = useState(false);

  const fromWallet = useMemo(() => Wallet.getById(fromAddress)!, [fromAddress]);

  const [loading, setLoading] = React.useState(false);

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
              from: converter(fromAddress),
              to: converter(result),
              nft,
            },
          );
        } else if (token) {
          return navigation.navigate(TransactionStackRoutes.TransactionSum, {
            from: converter(fromAddress),
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
    [navigation, nft, token, fromAddress],
  );

  const doneDisabled = useMemo(() => {
    if (!toAddress?.trim() || isError || !toChainId) {
      return true;
    }

    return (
      fromWallet.address?.toLowerCase() === toAddress?.toLowerCase() ||
      !AddressUtils.isValidAddress(toAddress)
    );
  }, [isError, toAddress, fromWallet]);

  const onPressAddress = useCallback(
    (item: string) => {
      vibrate(HapticEffects.impactLight);
      TransactionStore.toAddress = item;
    },
    [onDone],
  );

  const onPressButton = useCallback(() => {
    onDone(toAddress.trim());
  }, [toAddress, onDone]);

  const showCorrectNetworkError = useMemo(
    () => !isError && !toChainId && toAddress.length > 3,
    [isError, toChainId, toAddress],
  );

  return (
    <KeyboardSafeArea style={styles.keyboardAvoidingView}>
      <View style={styles.inputArea}>
        <TransactionAddressInput
          testID={testID}
          isError={isError}
          setIsError={setIsError}
          onDone={onDone}
        />
        <Spacer width={8} />
        <TransactionAddressNetwork />
      </View>
      {showCorrectNetworkError && (
        <Text
          variant={TextVariant.t14}
          color={Color.textRed1}
          i18n={I18N.unsupportedNetworkError}
        />
      )}
      <TransactionAddressWalletList onPress={onPressAddress} />
      <TransactionAddressContactList onPress={onPressAddress} />
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
  inputArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
