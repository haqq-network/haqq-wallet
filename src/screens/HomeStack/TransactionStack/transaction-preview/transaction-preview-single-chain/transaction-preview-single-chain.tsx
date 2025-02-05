import {useCallback, useMemo, useState} from 'react';

import {makeID} from '@haqq/shared-react-native';
import {observer} from 'mobx-react';
import {ScrollView, View} from 'react-native';

import {AddressHighlight, TokenIcon} from '@app/components';
import {Button, ButtonVariant, Spacer, TextVariant} from '@app/components/ui';
import {
  createTheme,
  getProviderInstanceForWallet,
  showModal,
} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation} from '@app/hooks';
import {useError} from '@app/hooks/use-error';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {EthSignErrorDataDetails} from '@app/services/eth-sign';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, ModalType} from '@app/types';

import {TransactionPreviewSingleChainFrom} from './transaction-preview-single-chain-from';
import {TransactionPreviewSingleChainInfo} from './transaction-preview-single-chain-info';

import {TransactionStore} from '../../transaction-store';

export const TransactionPreviewSingleChain = observer(() => {
  const {wallet, fromAsset, fromAmount, fromChainId, toAddress, fee} =
    TransactionStore;

  const navigation = useTypedNavigation<TransactionStackParamList>();
  const showError = useError();

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const amount = useMemo(
    () =>
      new Balance(
        Number(fromAmount),
        fromAsset?.decimals ?? undefined,
        fromAsset?.symbol ?? undefined,
      ),
    [],
  );

  const onSendTransaction = useCallback(async () => {
    if (wallet) {
      try {
        setIsButtonDisabled(true);

        const ethNetworkProvider = new EthNetwork();
        const networkProvider = Provider.getByEthChainId(fromChainId!);
        const walletProvider = await getProviderInstanceForWallet(
          wallet,
          false,
          networkProvider,
        );
        const to = networkProvider?.isTron
          ? AddressUtils.hexToTron(toAddress)
          : AddressUtils.toEth(toAddress);

        if (fee?.calculatedFees) {
          let transaction;
          if (fromAsset?.is_erc20) {
            const contractAddress = networkProvider?.isTron
              ? AddressUtils.hexToTron(fromAsset.id)
              : AddressUtils.toEth(fromAsset.id);
            transaction = await ethNetworkProvider.transferERC20(
              fee.calculatedFees,
              walletProvider,
              wallet,
              to,
              amount,
              contractAddress,
              networkProvider,
            );
          } else {
            transaction = await ethNetworkProvider.transferTransaction(
              fee.calculatedFees,
              walletProvider,
              wallet,
              to,
              amount,
              networkProvider,
            );
          }

          if (transaction) {
            EventTracker.instance.trackEvent(MarketingEvents.sendFund);

            navigation.navigate(TransactionStackRoutes.TransactionResult, {
              transaction,
            });
          }
        }
      } catch (e) {
        const errorId = makeID(4);

        Logger.captureException(e, 'transaction-confirmation', {
          from: wallet.address,
          to: toAddress,
          amount: amount.toHex(),
          id: errorId,
          walletType: wallet.type,
          fromAsset,
          provider: Provider.getByEthChainId(fromChainId!)?.name,
        });

        const err = e as EthSignErrorDataDetails;
        const txInfo = err?.transaction;
        const errCode = err?.code;

        if (
          !!txInfo?.gasLimit &&
          !!txInfo?.maxFeePerGas &&
          errCode === 'INSUFFICIENT_FUNDS'
        ) {
          err.handled = true;
          const gasLimit = new Balance(txInfo.gasLimit).operate(
            new Balance(txInfo.gasPrice || txInfo.maxFeePerGas),
            'mul',
          );
          showModal(ModalType.notEnoughGas, {
            gasLimit: gasLimit,
            currentAmount: Wallet.getBalance(wallet!.address, 'available'),
          });
          return;
        }

        // @ts-ignore
        const errMsg = e?.message || e?.toString?.() || JSON.stringify(e);
        if (errMsg) {
          showError(errorId, errMsg);
        }
      } finally {
        setIsButtonDisabled(false);
      }
    }
  }, [wallet, amount, navigation, wallet.address, toAddress, fee]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <TokenIcon
          asset={fromAsset}
          width={64}
          height={64}
          viewStyle={styles.icon}
        />
        <TransactionPreviewSingleChainFrom />
        <Spacer height={16} />
        <View style={styles.sendToContainer}>
          <AddressHighlight
            title={I18N.transactionAddressSendTo}
            address={toAddress}
            centered
            subtitleProps={{
              variant: TextVariant.t11,
            }}
          />
        </View>
        <Spacer height={24} />
        <TransactionPreviewSingleChainInfo />
      </ScrollView>
      <Button
        disabled={isButtonDisabled}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumSendTitle}
        onPress={onSendTransaction}
        style={styles.submit}
      />
    </View>
  );
});

const styles = createTheme({
  screen: {
    paddingHorizontal: 20,
    flex: 1,
    paddingBottom: 16,
  },
  scrollView: {
    alignItems: 'center',
  },
  icon: {
    position: 'relative',
  },
  sendToContainer: {
    width: '60%',
    alignItems: 'center',
  },
  submit: {
    marginVertical: 16,
  },
});
