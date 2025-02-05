import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {DataView, Icon, IconsName, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForFee} from '@app/helpers/await-for-fee';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {TransactionStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {getERC20TransferData} from '@app/services/eth-network/erc20';

import {TransactionStore} from '../../transaction-store';

export const TransactionPreviewSingleChainInfo = observer(() => {
  const {fromAmount, fromAsset, fromChainId, wallet, toAddress, fee} =
    TransactionStore;

  const provider = useMemo(
    () => Provider.getByEthChainId(fromChainId!),
    [fromChainId],
  );

  const assetName = useMemo(
    () => (fromAsset ? fromAsset.name : ''),
    [fromAsset],
  );
  const assetSymbol = useMemo(
    () => (fromAsset ? fromAsset.symbol : ''),
    [fromAsset],
  );

  const networkName = useMemo(() => provider?.name ?? '', [provider]);
  const networkType = useMemo(() => provider?.networkType ?? '', [provider]);

  const amount = useMemo(
    () => new Balance(Number(fromAmount), provider?.decimals, provider?.denom),
    [provider, fromAmount],
  );

  const {from, to, value, data} = useMemo(() => {
    const contractAddress = AddressUtils.toEth(fromAsset!.id);
    const isTron = Provider.getByEthChainId(fromChainId!)?.isTron;

    const txData = isTron
      ? AddressUtils.hexToTron(contractAddress)
      : getERC20TransferData(toAddress, amount, contractAddress);

    return {
      from: wallet.address,
      to: fromAsset!.is_erc20 ? contractAddress : toAddress,
      value: fromAsset!.is_erc20 ? undefined : amount,
      data: txData,
    };
  }, [fromAsset, wallet?.address, amount, toAddress, fromChainId]);

  const onFeePress = useCallback(async () => {
    if (fee) {
      const result = await awaitForFee(
        {
          fee,
          from,
          to,
          value,
          data,
          chainId: fromChainId,
        },
        TransactionStackRoutes.TransactionFeeSettings,
      );

      TransactionStore.fee = result;
    }
  }, [fee, from, to, value, data, fromChainId]);

  return (
    <View style={styles.info}>
      <DataView i18n={I18N.transactionDetailCryptocurrency}>
        <Text variant={TextVariant.t11} color={Color.textBase1}>
          {`${assetName} `}
          <Text variant={TextVariant.t11} color={Color.textBase2}>
            {`(${assetSymbol})`}
          </Text>
        </Text>
      </DataView>
      <DataView i18n={I18N.transactionDetailNetwork}>
        <Text variant={TextVariant.t11} color={Color.textBase1}>
          {`${networkName} `}
          <Text
            color={Color.textBase2}>{`(${networkType.toUpperCase()})`}</Text>
        </Text>
      </DataView>
      <DataView i18n={I18N.transactionDetailAmount}>
        <Text variant={TextVariant.t11} color={Color.textBase1}>
          {amount.toBalanceString()}
        </Text>
      </DataView>
      <DataView i18n={I18N.transactionDetailNetworkFee}>
        {!fee ? (
          <Text variant={TextVariant.t11} color={Color.textBase1}>
            {getText(I18N.estimatingGas)}
          </Text>
        ) : (
          <View style={styles.feeContainer}>
            <Text
              variant={TextVariant.t11}
              color={provider?.isEVM ? Color.textGreen1 : Color.textBase1}
              onPress={onFeePress}>
              {fee.expectedFee?.toBalanceString()}
            </Text>
            {provider?.isEVM && (
              <Icon name={IconsName.tune} color={Color.textGreen1} />
            )}
          </View>
        )}
      </DataView>
    </View>
  );
});

const styles = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  contact: {
    marginHorizontal: 27.5,
    fontWeight: '600',
    height: 30,
  },
  address: {
    marginBottom: 40,
    marginHorizontal: 27.5,
  },
  subtitle: {
    marginBottom: 4,
  },
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
  },
  info: {
    borderRadius: 16,
    backgroundColor: Color.bg3,
    width: '100%',
  },
  sum: {
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 38,
  },
  submit: {
    marginVertical: 16,
  },
  spacer: {
    justifyContent: 'flex-start',
  },
  feeContainer: {
    flexDirection: 'row',
  },
});
