import React, {useCallback, useMemo, useState} from 'react';

import {ActivityIndicator, ScrollView, View} from 'react-native';

import {Color} from '@app/colors';
import {
  DataView,
  First,
  Icon,
  IconsName,
  InfoBlock,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {awaitForFee} from '@app/helpers/await-for-fee';
import {useTypedNavigation} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {Fee} from '@app/models/fee';
import {Provider} from '@app/models/provider';
import {JsonRpcSignPopupStackParamList} from '@app/route-types';
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
  fee?: Fee | null;
  setFee: React.Dispatch<React.SetStateAction<Fee | null>>;
}

export const JsonRpcTransactionInfo = ({
  request,
  metadata,
  verifyAddressResponse,
  chainId,
  hideContractAttention,
  fee,
  setFee,
}: JsonRpcTransactionInfoProps) => {
  const navigation = useTypedNavigation<JsonRpcSignPopupStackParamList>();

  const [isFeeLoading, setFeeLoading] = useState(true);

  const tx = useMemo(
    () => getTransactionFromJsonRpcRequest(request),
    [request],
  );

  const provider = useMemo(() => {
    return Provider.getByEthChainId(
      tx?.chainId ?? chainId ?? app.provider.ethChainId,
    );
  }, [chainId, tx]);

  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  const value = useMemo(() => {
    if (!tx?.value) {
      return Balance.Empty;
    }

    return new Balance(tx.value, provider?.decimals, provider?.denom);
  }, [tx, provider]);

  const calculateFee = useCallback(async () => {
    if (!tx) {
      return Balance.Empty;
    }

    try {
      const data = await EthNetwork.estimate({
        from: tx.from!,
        to: tx.to!,
        value: new Balance(
          tx.value! || Balance.Empty,
          provider?.decimals,
          provider?.denom,
        ),
        data: tx.data,
      });
      setFee(new Fee(data));
      return data.expectedFee;
    } catch {
      return Balance.Empty;
    }
  }, [tx, provider]);

  const total = useMemo(() => {
    const float = value.toFloat();
    const fixedNum = float >= 1 ? 3 : LONG_NUM_PRECISION;
    return value
      .operate(fee?.calculatedFees?.expectedFee ?? Balance.Empty, 'add')
      .toBalanceString(fixedNum);
  }, [value, fee?.calculatedFees?.expectedFee]);

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
    if (!fee?.calculatedFees) {
      try {
        if (tx) {
          setFeeLoading(true);
          await calculateFee();
        }
      } catch (err) {
        Logger.captureException(err, 'JsonRpcTransactionInfo:calculateFee', {
          params: tx,
          chainId,
        });
      } finally {
        setFeeLoading(false);
      }
    } else {
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

  const onFeePress = useCallback(async () => {
    if (!tx) {
      return;
    }

    if (fee) {
      const result = await awaitForFee({
        fee,
        from: tx.from!,
        to: tx.to!,
        value: new Balance(
          tx.value! || Balance.Empty,
          provider?.decimals,
          provider?.denom,
        ),
        data: tx.data,
      });
      setFee(result);
    }
  }, [navigation, tx, fee, provider]);

  return (
    <View style={styles.container}>
      <Text
        variant={TextVariant.t5}
        i18n={I18N.walletConnectSignTransactionForSignature}
      />

      <Spacer height={8} />

      <View style={styles.fromContainer}>
        <Text
          variant={TextVariant.t13}
          color={Color.textBase2}
          i18n={I18N.walletConnectSignForm}
        />
        <SiteIconPreview
          url={metadata.url}
          directIconUrl={metadata.iconUrl}
          size={SiteIconPreviewSize.s18}
          style={styles.fromImage}
        />
        <Text variant={TextVariant.t13} color={Color.textGreen1}>
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
        variant={TextVariant.t11}
        color={Color.textBase2}
        i18n={I18N.walletConnectSignTotalAmount}
      />

      <Spacer height={4} />

      <Text variant={TextVariant.t3}>{total}</Text>

      <Spacer height={16} />

      <Text
        variant={TextVariant.t11}
        color={Color.textBase2}
        i18n={I18N.walletConnectSignSendTo}
      />

      <Spacer height={4} />

      <Text variant={TextVariant.t11} color={Color.textBase2}>
        {tx?.to}
      </Text>

      <Spacer height={28} />

      <ScrollView style={styles.info} showsVerticalScrollIndicator={false}>
        <DataView i18n={I18N.transactionInfoTypeOperation}>
          <Text variant={TextVariant.t11} color={Color.textBase1}>
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
          <Text variant={TextVariant.t11} color={Color.textBase1}>
            {`${provider?.coinName} ${provider?.denom}`}
          </Text>
        </DataView>
        {!!provider?.id && (
          <DataView i18n={I18N.transactionInfoNetwork}>
            <Text variant={TextVariant.t11} color={Color.textBase1}>
              {provider.name}
            </Text>
          </DataView>
        )}
        <DataView i18n={I18N.transactionInfoAmount}>
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            children={value.toBalanceString('auto')}
          />
        </DataView>
        <DataView i18n={I18N.transactionInfoNetworkFee}>
          <First>
            {isFeeLoading && <ActivityIndicator />}
            <View style={styles.feeContainer}>
              <Text
                variant={TextVariant.t11}
                color={Color.textGreen1}
                onPress={onFeePress}>
                {fee?.expectedFeeString}
              </Text>
              <Icon name={IconsName.tune} color={Color.textGreen1} />
            </View>
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
  feeContainer: {
    flexDirection: 'row',
  },
});
