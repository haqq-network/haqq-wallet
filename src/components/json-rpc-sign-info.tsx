import React, {useMemo} from 'react';

import {ScrollView, View} from 'react-native';

import {First, Spacer, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Color, createTheme} from '@app/theme';
import {JsonRpcMetadata, PartialJsonRpcRequest} from '@app/types';
import {
  getHostnameFromUrl,
  getSignParamsMessage,
  getSignTypedDataParamsData,
  isSupportedCosmosTxForRender,
  isValidJSON,
} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {JsonViewer} from './json-viewer';
import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';
import {TypedDataViewer} from './typed-data-viewer';
import {WalletRow, WalletRowTypes} from './wallet-row';

interface WalletConnectSignInfoProps {
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  wallet: Wallet;
}

const getMessageByRequest = (request: PartialJsonRpcRequest) => {
  switch (request?.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      const ethSignMessage: string = getSignParamsMessage(request.params) || '';

      if (isValidJSON(ethSignMessage)) {
        return {
          text: JSON.parse(ethSignMessage),
          json: true,
        };
      }

      if (ethSignMessage?.startsWith?.('0x')) {
        return {
          text: Buffer.from(ethSignMessage?.slice(2), 'hex').toString('utf8'),
        };
      }
      return {text: ethSignMessage};
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
  const isSupportedConsmosTx = useMemo(
    () => message?.json && isSupportedCosmosTxForRender(message.text),
    [message],
  );

  return (
    <View style={styles.container}>
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

      <First>
        {isSupportedConsmosTx && <TypedDataViewer data={message.text} />}
        <>
          <Text
            style={styles.messageTitle}
            t9
            i18n={I18N.walletConnectSignMessage}
          />
          <Spacer height={4} />
          <ScrollView style={styles.json} showsVerticalScrollIndicator={false}>
            {!message?.json && (
              <Text color={Color.textBase2} style={styles.message} t11>
                {message.text}
              </Text>
            )}
            {!!message?.json && (
              <ScrollView
                horizontal
                style={styles.json}
                showsHorizontalScrollIndicator={false}>
                <JsonViewer
                  autoexpand={false}
                  style={styles.json}
                  data={message.text}
                />
              </ScrollView>
            )}
          </ScrollView>
        </>
      </First>
    </View>
  );
};

const styles = createTheme({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  json: {
    flex: 1,
    width: '100%',
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
