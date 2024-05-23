import React, {useCallback, useMemo, useState} from 'react';

import {ActivityIndicator, ScrollView, View} from 'react-native';

import {Color} from '@app/colors';
import {
  DataView,
  First,
  Icon,
  InfoBlock,
  Spacer,
  Text,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {
  AddressType,
  JsonRpcMetadata,
  PartialJsonRpcRequest,
  VerifyAddressResponse,
} from '@app/types';
import {
  getHostnameFromUrl,
  getTransactionFromJsonRpcRequest,
  isContractTransaction,
  parseERC20TxDataFromHexInput,
} from '@app/utils';
import {LONG_NUM_PRECISION} from '@app/variables/common';

import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';

interface JsonRpcTransactionInfoProps {
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  verifyAddressResponse: VerifyAddressResponse | null;
  chainId?: number;
  hideContractAttention?: boolean;
}

export const JsonRpcTransactionInfo = ({
  request,
  metadata,
  verifyAddressResponse,
  chainId,
  hideContractAttention,
}: JsonRpcTransactionInfoProps) => {
  const [calculatedFee, setCalculatedFee] = useState(Balance.Empty);
  const [isFeeLoading, setFeeLoading] = useState(true);

  const tx = useMemo(
    () => getTransactionFromJsonRpcRequest(request),
    [request],
  );

  const provider = useMemo(() => {
    const _provider = Provider.getByEthChainId(
      chainId || tx?.chainId || app.provider.ethChainId,
    );
    return _provider!;
  }, [chainId]);

  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  const value = useMemo(() => {
    if (!tx?.value) {
      return Balance.Empty;
    }

    return new Balance(tx.value);
  }, [tx]);

  const getFee = useCallback(async () => {
    if (!tx) {
      return Balance.Empty;
    }

    try {
      const gasLimit = getRemoteBalanceValue('eth_min_gas_limit').max(
        new Balance(tx.gasLimit || '0'),
      );
      const {feeWei} = await EthNetwork.estimateTransaction(
        tx.from!,
        tx.to!,
        new Balance(tx.value! || Balance.Empty),
        tx.data,
        gasLimit,
        provider,
      );
      return feeWei;
    } catch {
      return Balance.Empty;
    }
  }, [tx, provider]);

  const total = useMemo(() => {
    const float = value.toFloat();
    const fixedNum = float >= 1 ? 3 : LONG_NUM_PRECISION;
    return value.operate(calculatedFee, 'add').toBalanceString(fixedNum);
  }, [value, calculatedFee]);

  const isContract = useMemo(
    () =>
      verifyAddressResponse?.address_type === AddressType.contract ||
      isContractTransaction(tx),
    [tx, verifyAddressResponse],
  );

  const isInWhiteList = useMemo(
    () => !!verifyAddressResponse?.is_in_white_list,
    [verifyAddressResponse],
  );

  const showSignContratAttention =
    !hideContractAttention && isContract && !isInWhiteList;

  useEffectAsync(async () => {
    try {
      if (tx) {
        setFeeLoading(true);
        const estimatedGas = await getFee();
        setCalculatedFee(estimatedGas);
      }
    } catch (err) {
      Logger.captureException(err, 'JsonRpcTransactionInfo:calculateFee', {
        params: tx,
        chainId,
      });
    } finally {
      setFeeLoading(false);
    }
  }, [chainId]);

  const txParsedData = useMemo(
    () => parseERC20TxDataFromHexInput(tx?.data),
    [tx],
  );

  const functionName = useMemo(() => {
    if (txParsedData) {
      return txParsedData.name;
    }
    return '';
  }, [txParsedData]);

  return (
    <View style={styles.container}>
      <Text t5 i18n={I18N.walletConnectSignTransactionForSignature} />

      <Spacer height={8} />

      <View style={styles.fromContainer}>
        <Text t13 color={Color.textBase2} i18n={I18N.walletConnectSignForm} />
        <SiteIconPreview
          url={metadata.url}
          directIconUrl={metadata.iconUrl}
          size={SiteIconPreviewSize.s18}
          style={styles.fromImage}
        />
        <Text t13 color={Color.textGreen1}>
          {url}
        </Text>
      </View>

      <Spacer height={24} />

      {showSignContratAttention && (
        <>
          <InfoBlock
            error
            icon={<Icon name={'warning'} color={Color.textRed1} />}
            i18n={I18N.signContratAttention}
            style={styles.signContractAttention}
          />
          <Spacer height={24} />
        </>
      )}

      <Text
        t11
        color={Color.textBase2}
        i18n={I18N.walletConnectSignTotalAmount}
      />

      <Spacer height={4} />

      <Text t3>{total}</Text>

      <Spacer height={16} />

      <Text t11 color={Color.textBase2} i18n={I18N.walletConnectSignSendTo} />

      <Spacer height={4} />

      <Text t11 color={Color.textBase2}>
        {tx?.from}
      </Text>

      <Spacer height={28} />

      <ScrollView style={styles.info} showsVerticalScrollIndicator={false}>
        <DataView i18n={I18N.transactionInfoTypeOperation}>
          <Text t11 color={Color.textBase1}>
            {functionName?.length ? (
              <Text children={functionName} />
            ) : (
              <Text
                i18n={
                  isContract
                    ? I18N.transactionInfoContractInteraction
                    : I18N.transactionInfoSendingFunds
                }
              />
            )}
          </Text>
        </DataView>
        <DataView i18n={I18N.transactionInfoCryptocurrency}>
          <Text t11 color={Color.textBase1}>
            <Text i18n={I18N.transactionConfirmationIslamicCoin} />{' '}
            <Text
              color={Color.textBase2}
              i18n={I18N.transactionConfirmationISLM}
            />
          </Text>
        </DataView>
        {!!provider?.id && (
          <DataView i18n={I18N.transactionInfoNetwork}>
            <Text t11 color={Color.textBase1}>
              {provider.name}
            </Text>
          </DataView>
        )}
        <DataView i18n={I18N.transactionInfoAmount}>
          <Text
            t11
            color={Color.textBase1}
            children={value.toBalanceString('auto')}
          />
        </DataView>
        <DataView i18n={I18N.transactionInfoNetworkFee}>
          <First>
            {isFeeLoading && <ActivityIndicator />}
            <Text t11 color={Color.textBase1}>
              {calculatedFee.toBalanceString('auto')}
            </Text>
          </First>
        </DataView>
      </ScrollView>
      <Spacer height={10} />
    </View>
  );
};

const styles = createTheme({
  info: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  fromContainer: {
    flexDirection: 'row',
  },
  fromImage: {
    marginHorizontal: 4,
  },
  signContractAttention: {
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
});
