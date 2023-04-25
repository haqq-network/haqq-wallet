import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {JsonRpcMetadata, PartialJsonRpcRequest} from '@app/types';
import {getHostnameFromUrl, getSignTypedDataParamsData} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {JsonViewer} from './json-viewer';
import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';
import {WalletRow, WalletRowTypes} from './wallet-row';

interface WalletConnectSignInfoProps {
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  wallet: Wallet;
}

const getMessageByRequest = (request: PartialJsonRpcRequest) => {
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
        text: getSignTypedDataParamsData(request.params),
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

export const JsonRpcSignInfo = ({
  wallet,
  metadata,
  request,
}: WalletConnectSignInfoProps) => {
  const message = useMemo(() => getMessageByRequest(request), [request]);
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);

  return (
    <>
      <Text t5 i18n={I18N.walletConnectSignSignMessage} />

      <Spacer height={8} />

      <View style={styles.fromContainer}>
        <Text t13 color={Color.textBase2} i18n={I18N.walletConnectSignForm} />
        <SiteIconPreview
          url={metadata.url}
          directIconUrl={metadata.iconUrl}
          style={styles.fromImage}
          size={SiteIconPreviewSize.s18}
        />
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
