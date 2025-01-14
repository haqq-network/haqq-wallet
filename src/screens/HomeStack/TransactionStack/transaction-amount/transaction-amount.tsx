import React, {useEffect} from 'react';

import {observer} from 'mobx-react';

import {useTypedNavigation} from '@app/hooks';
import {TransactionStackParamList} from '@app/route-types';

import {TransactionAmountRightHeaderOptions} from './transaction-amount-right-header-options';
import {TransactionAmountSingleChain} from './transaction-amount-single-chain';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {fromChainId, toChainId} = TransactionStore;

  useEffect(() => {
    navigation.setOptions({
      headerRight: props => <TransactionAmountRightHeaderOptions {...props} />,
    });
  }, []);

  switch (fromChainId) {
    case toChainId:
      return <TransactionAmountSingleChain />;
    default:
      return null;
  }

  // useAndroidBackHandler(() => {
  //   navigation.goBack();
  //   return true;
  // }, [navigation]);

  // const event = useMemo(() => generateUUID(), []);
  // const provider = fromChainId
  //   ? Provider.getByEthChainId(fromChainId)
  //   : Provider.selectedProvider;
  // const balances = Wallet.getBalancesByAddressList([fromWallet!], provider);
  // const currentBalance = useMemo(
  //   () => balances[AddressUtils.toEth(fromAddress)],
  //   [balances, fromAddress],
  // );
  // const [fee, setFee] = useState<Balance | null>(null);
  // const contact = useMemo(() => Contact.getById(toAddress), [toAddress]);
  // const [isLoading, setLoading] = useState(false);

  // const getFee = useCallback(
  //   async (amount: Balance) => {
  //     try {
  //       if (asset?.is_erc20) {
  //         const contractAddress = provider?.isTron
  //           ? AddressUtils.hexToTron(asset.id)
  //           : AddressUtils.toEth(asset.id);
  //         return await EthNetwork.estimateERC20Transfer(
  //           {
  //             from: fromWallet!.address!,
  //             to: toAddress,
  //             amount,
  //             contractAddress,
  //           },
  //           EstimationVariant.average,
  //           provider,
  //         );
  //       } else {
  //         return await EthNetwork.estimate(
  //           {
  //             from: fromAddress,
  //             to: toAddress,
  //             value: amount,
  //           },
  //           EstimationVariant.average,
  //           provider,
  //         );
  //       }
  //     } catch (err) {
  //       Logger.log('tx sum err getFee', err);
  //       return null;
  //     }
  //   },
  //   [fromAddress, toAddress, asset, provider, fromWallet],
  // );

  // const onPressPreview = useCallback(
  //   async (amount: Balance, repeated = false) => {
  //     setLoading(true);
  //     const showError = () => {
  //       showModal(ModalType.error, {
  //         title: getText(I18N.feeCalculatingRpcErrorTitle),
  //         description: getText(I18N.feeCalculatingRpcErrorDescription),
  //         close: getText(
  //           repeated ? I18N.cancel : I18N.feeCalculatingRpcErrorClose,
  //         ),
  //         onClose: () => {
  //           if (!repeated) {
  //             onPressPreview(amount, true);
  //           }
  //         },
  //       });
  //     };
  //     try {
  //       const estimate = await getFee(amount);
  //       const balance = Wallet.getBalance(
  //         route.params.from,
  //         'available',
  //         provider,
  //       );

  //       let totalAmount = estimate?.expectedFee;

  //       if (amount.isNativeCoin) {
  //         totalAmount = totalAmount?.operate(amount, 'add');
  //       }

  //       if (totalAmount && totalAmount.compare(balance, 'gt')) {
  //         return showModal(ModalType.notEnoughGas, {
  //           gasLimit: estimate?.expectedFee!,
  //           currentAmount: balance,
  //         });
  //       }

  //       let successCondition = false;

  //       if (provider.isTron) {
  //         // fee can be zero for TRON if user has enough bandwidth (freezed TRX)
  //         successCondition = !!estimate?.expectedFee ?? false;
  //       } else {
  //         successCondition = estimate?.expectedFee.isPositive() ?? false;
  //       }

  //       if (successCondition) {
  //         navigation.navigate(TransactionStackRoutes.TransactionConfirmation, {
  //           // @ts-ignore
  //           calculatedFees: estimate,
  //           from: route.params.from,
  //           to,
  //           amount,
  //           token: route.params.token,
  //         });
  //       } else {
  //         showError();
  //       }
  //     } catch (err) {
  //       Logger.captureException(err, 'TransactionAmountScreen:onPressPreview', {
  //         amount,
  //         provider: provider.name,
  //       });
  //       showError();
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [fee, navigation, route.params.from, to, provider],
  // );

  // const onContact = useCallback(() => {
  //   vibrate(HapticEffects.impactLight);
  //   navigation.navigate(TransactionStackRoutes.TransactionSumAddress, {
  //     to,
  //     from: route.params.from,
  //     event,
  //   });
  // }, [event, navigation, to]);

  // const onToken = useCallback(() => {
  //   navigation.goBack();
  // }, [navigation]);

  // useEffectAsync(async () => {
  //   const getMinAmount = () => {
  //     const token = route.params.token;
  //     // for network native coin
  //     if (token.symbol === provider.denom) {
  //       return new Balance(0.0000001, 0);
  //     }

  //     // for others tokens
  //     return new Balance(
  //       Number(`0.${'0'.repeat(token.decimals! - 1)}1`),
  //       token.decimals!,
  //       token.symbol!,
  //     );
  //   };

  //   const estimate = await getFee(getMinAmount());
  //   setFee(estimate?.expectedFee ?? null);
  // }, [to]);

  // return (
  //   <TransactionSum
  //     contact={contact}
  //     balance={currentBalance.available}
  //     fee={fee}
  //     to={to}
  //     from={route.params.from}
  //     onPressPreview={onPressPreview}
  //     onContact={onContact}
  //     onToken={onToken}
  //     testID="transaction_sum"
  //     token={route.params.token}
  //     isLoading={isLoading}
  //     provider={provider}
  //   />
  // );
});
