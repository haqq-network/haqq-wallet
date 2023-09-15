import React, {useMemo} from 'react';

import Decimal from 'decimal.js';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {DataView, Icon, InfoBlock, Spacer, Text} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
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
import {CURRENCY_NAME, WEI} from '@app/variables/common';

import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';

interface WalletConnectTransactionInfoProps {
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  verifyAddressResponse: VerifyAddressResponse | null;
}

export const JsonRpcTransactionInfo = ({
  request,
  metadata,
  verifyAddressResponse,
}: WalletConnectTransactionInfoProps) => {
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

  const estimateFee = useMemo(
    () => cleanNumber(demicalEstimateFee.toString(), ' ', 2),
    [demicalEstimateFee],
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
          <Text t11 color={Color.textBase1}>
            {/* TODO: Migrate to estimateFee.toWeiString() */}
            {`${estimateFee} a${CURRENCY_NAME}`}
          </Text>
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
