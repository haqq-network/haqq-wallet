import React, {useMemo} from 'react';

import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {getHostnameFromUrl} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {JsonViewer} from './json-viewer';
import {WalletRow, WalletRowTypes} from './wallet-row';

interface WalletConnectSignInfoProps {
  session: SessionTypes.Struct;
  event: SignClientTypes.EventArguments['session_request'];
  wallet: Wallet;
}

const getMessageByEvent = (
  event: SignClientTypes.EventArguments['session_request'],
) => {
  const request = event?.params?.request;

  switch (request?.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      return {
        text: Buffer.from(request.params?.[0]?.slice(2), 'hex').toString(
          'utf8',
        ),
      };
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      return {
        text: Buffer.from(request.params?.[1]?.slice(2), 'hex').toString(
          'utf8',
        ),
      };
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      return {
        text: JSON.parse(request.params?.[1]),
        json: true,
      };
    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
    default:
      return {
        text: request.params,
        json: true,
      };
  }
};

export const WalletConnectSignInfo = ({
  session,
  event,
  wallet,
}: WalletConnectSignInfoProps) => {
  const metadata = useMemo(() => session?.peer?.metadata, [session]);
  const message = useMemo(() => getMessageByEvent(event), [event]);
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);
  const imageSource = useMemo(() => ({uri: metadata?.icons?.[0]}), [metadata]);

  return (
    <>
      <Text t5 i18n={I18N.walletConnectSignSignMessage} />

      <Spacer height={8} />

      <View style={styles.fromContainer}>
        <Text t13 color={Color.textBase2} i18n={I18N.walletConnectSignForm} />
        <Image style={styles.fromImage} source={imageSource} />
        <Text t13 color={Color.textGreen1}>
          {url}
        </Text>
      </View>

      <Spacer height={32} />

      <WalletRow hideArrow item={wallet} type={WalletRowTypes.variant2} />

      <Spacer height={12} />

      <Text
        style={styles.messageTitle}
        t9
        i18n={I18N.walletConnectSignMessage}
      />
      <Spacer height={4} />
      {!message?.json && (
        <Text color={Color.textBase2} style={styles.message} t11>
          {message.text}
        </Text>
      )}

      {!!message?.json && (
        <JsonViewer style={styles.json} data={message.text} />
      )}
    </>
  );
};

const styles = createTheme({
  json: {
    width: '40%',
  },
  messageTitle: {
    alignSelf: 'flex-start',
  },
  message: {
    alignSelf: 'flex-start',
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
