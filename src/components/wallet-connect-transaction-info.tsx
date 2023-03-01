import React, {useMemo} from 'react';

import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import Decimal from 'decimal.js';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {DataView, Spacer, Text} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {getHostnameFromUrl} from '@app/utils';
import {WEI} from '@app/variables/common';

interface WalletConnectTransactionInfoProps {
  session: SessionTypes.Struct;
  event: SignClientTypes.EventArguments['session_request'];
}

export const WalletConnectTransactionInfo = ({
  session,
  event,
}: WalletConnectTransactionInfoProps) => {
  const metadata = useMemo(() => session?.peer?.metadata, [session]);
  const params = useMemo(() => event?.params?.request?.params?.[0], [event]);
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);
  const imageSource = useMemo(() => ({uri: metadata?.icons?.[0]}), [metadata]);

  const demicalAmount = useMemo(
    () => new Decimal(params?.value).div(WEI),
    [params],
  );

  const demicalEstimateFee = useMemo(
    () => new Decimal(params?.gasPrice),
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
    () => cleanNumber(demicalAmount.add(demicalEstimateFee).toString(), ' ', 2),
    [demicalAmount, demicalEstimateFee],
  );

  return (
    <>
      <Text t5 i18n={I18N.walletConnectSignTransactionForSignature} />

      <Spacer height={8} />

      <View style={styles.fromContainer}>
        <Text t13 color={Color.textBase2} i18n={I18N.walletConnectSignForm} />
        <Image style={styles.fromImage} source={imageSource} />
        <Text t13 color={Color.textGreen1}>
          {url}
        </Text>
      </View>

      <Spacer height={24} />

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
          <Text
            t11
            color={Color.textBase1}
            i18n={I18N.transactionConfirmationestimateFee}
            i18params={{
              estimateFee,
            }}
          />
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
    width: 18,
    height: 18,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
