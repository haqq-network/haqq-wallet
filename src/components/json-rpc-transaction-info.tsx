import React, {useMemo, useState} from 'react';

import Decimal from 'decimal.js';
import {ActivityIndicator, View} from 'react-native';

import {Color} from '@app/colors';
import {
  DataView,
  First,
  Icon,
  InfoBlock,
  Spacer,
  Text,
} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {getRpcProvider} from '@app/helpers/get-rpc-provider';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {getDefaultNetwork} from '@app/network';
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
} from '@app/utils';
import {WEI} from '@app/variables/common';

import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';

interface WalletConnectTransactionInfoProps {
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  verifyAddressResponse: VerifyAddressResponse | null;
  chainId?: number;
}

export const JsonRpcTransactionInfo = ({
  request,
  metadata,
  verifyAddressResponse,
  chainId,
}: WalletConnectTransactionInfoProps) => {
  const [calculatedFee, setCalculatedFee] = useState(Balance.Empty);
  const [isFeeLoading, setFeeLoading] = useState(true);

  const params = useMemo(
    () => getTransactionFromJsonRpcRequest(request),
    [request],
  );

  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  const demicalAmount = useMemo(
    () =>
      params?.value ? new Decimal(params?.value).div(WEI) : new Decimal(0),
    [params],
  );

  const demicalEstimateFee = useMemo(
    () => (params?.gasPrice ? new Decimal(params?.gasPrice) : new Decimal(0)),
    [params],
  );

  const amount = useMemo(
    () => cleanNumber(demicalAmount.toString(), ' ', 2),
    [demicalAmount],
  );

  const total = useMemo(
    () =>
      cleanNumber(
        demicalAmount.add(demicalEstimateFee.div(WEI)).toString(),
        ' ',
        2,
      ),
    [demicalAmount, demicalEstimateFee],
  );

  const isContract = useMemo(
    () =>
      verifyAddressResponse?.addressType === AddressType.contract ||
      isContractTransaction(params),
    [params, verifyAddressResponse],
  );

  const isInWhiteList = useMemo(
    () => !!verifyAddressResponse?.isInWhiteList,
    [verifyAddressResponse],
  );

  const showSignContratAttention = isContract && !isInWhiteList;

  useEffectAsync(async () => {
    try {
      if (params) {
        setFeeLoading(true);
        const provider = chainId && Provider.getByEthChainId(chainId);
        const rpcProvider = provider
          ? await getRpcProvider(provider)
          : getDefaultNetwork();
        const {_hex} = await rpcProvider.estimateGas(params);
        setCalculatedFee(new Balance(_hex));
      }
    } catch (err) {
      Logger.captureException(err, 'JsonRpcTransactionInfo:calculateFee', {
        params,
        chainId,
      });
    } finally {
      setFeeLoading(false);
    }
  }, [chainId]);

  return (
    <>
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

      <Text t3>{total} ISLM</Text>

      <Spacer height={16} />

      <Text t11 color={Color.textBase2} i18n={I18N.walletConnectSignSendTo} />

      <Spacer height={4} />

      <Text t11 color={Color.textBase2}>
        {params?.from}
      </Text>

      <Spacer height={28} />

      <View style={styles.info}>
        <DataView label="Type of operation">
          <Text t11 color={Color.textBase1}>
            <Text children={'Sending funds'} />
          </Text>
        </DataView>
        <DataView label="Cryptocurrency">
          <Text t11 color={Color.textBase1}>
            <Text i18n={I18N.transactionConfirmationIslamicCoin} />{' '}
            <Text
              color={Color.textBase2}
              i18n={I18N.transactionConfirmationISLM}
            />
          </Text>
        </DataView>
        <DataView label="Network">
          <Text t11 color={Color.textBase1}>
            <Text i18n={I18N.transactionConfirmationHAQQ} />{' '}
            <Text
              color={Color.textBase2}
              i18n={I18N.transactionConfirmationHQ}
            />
          </Text>
        </DataView>
        <DataView label="Amount">
          <Text
            t11
            color={Color.textBase1}
            i18n={I18N.transactionConfirmationAmount}
            i18params={{amount}}
          />
        </DataView>
        <DataView label="Network Fee">
          <First>
            {isFeeLoading && <ActivityIndicator />}
            <Text t11 color={Color.textBase1}>
              {calculatedFee.toWeiString()}
            </Text>
          </First>
        </DataView>
      </View>
    </>
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
});
