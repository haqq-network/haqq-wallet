import {useMemo} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {DataView, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';

import {TransactionStore} from '../../transaction-store';

export const TransactionPreviewSingleChainInfo = observer(() => {
  const {fromAmount, fromAsset, fromChainId} = TransactionStore;

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
        {/* {!fee?.calculatedFees ? (
          <Text variant={TextVariant.t11} color={Color.textBase1}>
            {getText(I18N.estimatingGas)}
          </Text>
        ) : (
          <View style={styles.feeContainer}>
            <Text
              variant={TextVariant.t11}
              color={
                transactionSumError
                  ? Color.graphicRed1
                  : Provider.selectedProvider.isEVM
                  ? Color.textGreen1
                  : Color.textBase1
              }
              disabled={Provider.getByEthChainId(token.chain_id)?.isTron}
              onPress={onFeePress}>
              {Provider.getByEthChainId(token.chain_id)?.isTron
                ? fee.expectedFee?.toBalanceString()
                : fee.expectedFeeString}
            </Text>
            {Provider.selectedProvider.isEVM && (
              <Icon
                name={IconsName.tune}
                color={
                  transactionSumError ? Color.graphicRed1 : Color.textGreen1
                }
              />
            )}
          </View>
        )} */}
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
