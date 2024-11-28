import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
} from '@app/components/ui';
import {createTheme, showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {NetworkProviderTypes} from '@app/services/backend';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';

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

  const {toAddress, fromAddress} = TransactionStore;

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
          if (!Token.tokens?.[AddressUtils.toEth(fromAddress)]) {
            const hide = showModal(ModalType.loading, {
              text: 'Loading token balances',
            });
            try {
              await Token.fetchTokens(true, true);
            } catch {
            } finally {
              hide();
            }
          }
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
    if (!toAddress?.trim() || isError) {
      return true;
    }

    if (Provider.selectedProvider.isTron) {
      return (
        // can't send to the same wallet
        fromWallet.tronAddress?.toLowerCase() === toAddress?.toLowerCase() ||
        !AddressUtils.isTronAddress(toAddress)
      );
    }
    return (
      fromWallet.address?.toLowerCase() === toAddress?.toLowerCase() ||
      fromWallet.cosmosAddress?.toLowerCase() === toAddress?.toLowerCase() ||
      !AddressUtils.isValidAddress(toAddress)
    );
  }, [isError, toAddress, fromWallet]);

  const onPressAddress = useCallback(
    (item: string) => {
      vibrate(HapticEffects.impactLight);
      onDone(item);
    },
    [onDone],
  );

  const onPressButton = useCallback(() => {
    onDone(toAddress.trim());
  }, [toAddress, onDone]);

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
