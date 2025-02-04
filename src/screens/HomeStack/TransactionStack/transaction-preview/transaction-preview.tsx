import {observer} from 'mobx-react';

import {useTypedNavigation} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {TransactionStackParamList} from '@app/route-types';

import {TransactionPreviewSingleChain} from './transaction-preview-single-chain';

import {TransactionStore} from '../transaction-store';

export const TransactionPreviewScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {fromChainId, toChainId} = TransactionStore;

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  switch (fromChainId) {
    case toChainId:
    default:
      return <TransactionPreviewSingleChain />;
  }

  // const {token, calculatedFees} = route.params;
  // const visible = Wallet.getAllVisible();
  // const balance = Wallet.getBalancesByAddressList(visible);

  // const [fee, setFee] = useState<Fee>(new Fee(calculatedFees!));

  // const wallet = Wallet.getById(route.params.from);
  // const contact = useMemo(
  //   () => Contact.getById(route.params.to),
  //   [route.params.to],
  // );
  // const showError = useError();
  // const [disabled, setDisabled] = useState(false);

  // const onConfirmTransaction = useCallback(async () => {
  //   if (wallet) {
  //     try {
  //       setDisabled(true);

  //       const ethNetworkProvider = new EthNetwork();
  //       const networkProvider = Provider.getByEthChainId(token.chain_id);
  //       const walletProvider = await getProviderInstanceForWallet(
  //         wallet,
  //         false,
  //         networkProvider,
  //       );

  //       if (fee?.calculatedFees) {
  //         let transaction;
  //         if (token.is_erc20) {
  //           const contractAddress = networkProvider?.isTron
  //             ? AddressUtils.hexToTron(token.id)
  //             : AddressUtils.toEth(token.id);
  //           transaction = await ethNetworkProvider.transferERC20(
  //             fee.calculatedFees,
  //             walletProvider,
  //             wallet,
  //             route.params.to,
  //             route.params.amount,
  //             contractAddress,
  //             networkProvider,
  //           );
  //         } else {
  //           transaction = await ethNetworkProvider.transferTransaction(
  //             fee.calculatedFees,
  //             walletProvider,
  //             wallet,
  //             route.params.to,
  //             route.params.amount,
  //             networkProvider,
  //           );
  //         }

  //         if (transaction) {
  //           EventTracker.instance.trackEvent(MarketingEvents.sendFund);

  //           navigation.navigate(TransactionStackRoutes.TransactionFinish, {
  //             fee,
  //             transaction,
  //             to: route.params.to,
  //             hash: transaction.hash,
  //             token: route.params.token,
  //             amount: token.is_erc20 ? route.params.amount : undefined,
  //           });
  //         }
  //       }
  //     } catch (e) {
  //       const errorId = makeID(4);

  //       Logger.captureException(e, 'transaction-confirmation', {
  //         from: route.params.from,
  //         to: route.params.to,
  //         amount: route.params.amount.toHex(),
  //         id: errorId,
  //         walletType: wallet.type,
  //         token,
  //         contact,
  //         provider: Provider.getByEthChainId(token.chain_id)?.name,
  //       });

  //       const err = e as EthSignErrorDataDetails;
  //       const txInfo = err?.transaction;
  //       const errCode = err?.code;

  //       if (
  //         !!txInfo?.gasLimit &&
  //         !!txInfo?.maxFeePerGas &&
  //         errCode === 'INSUFFICIENT_FUNDS'
  //       ) {
  //         err.handled = true;
  //         const gasLimit = new Balance(txInfo.gasLimit).operate(
  //           new Balance(txInfo.gasPrice || txInfo.maxFeePerGas),
  //           'mul',
  //         );
  //         showModal(ModalType.notEnoughGas, {
  //           gasLimit: gasLimit,
  //           currentAmount: Wallet.getBalance(wallet!.address, 'available'),
  //         });
  //         return;
  //       }

  //       // @ts-ignore
  //       const errMsg = e?.message || e?.toString?.() || JSON.stringify(e);
  //       if (errMsg) {
  //         showError(errorId, errMsg);
  //       }
  //     } finally {
  //       setDisabled(false);
  //     }
  //   }
  // }, [
  //   navigation,
  //   route.params.amount,
  //   route.params.from,
  //   route.params.to,
  //   wallet,
  //   fee,
  // ]);

  // const onPressToAddress = useCallback(() => {
  //   Clipboard.setString(route.params.to);
  //   sendNotification(I18N.notificationCopied);
  // }, [route.params.to]);

  // return (
  //   <TransactionConfirmation
  //     balance={balance[AddressUtils.toEth(route.params.from)]}
  //     disabled={disabled}
  //     contact={contact}
  //     to={route.params.to}
  //     amount={route.params.amount}
  //     onConfirmTransaction={onConfirmTransaction}
  //     onFeePress={onFeePress}
  //     onPressToAddress={onPressToAddress}
  //     fee={fee}
  //     testID="transaction_confirmation"
  //     token={route.params.token}
  //   />
  // );
});
