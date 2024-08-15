import React, {useMemo} from 'react';

import {Transaction} from 'ethers';
import {ScrollView, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconsName,
  InfoBlock,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {EthereumSignInMessage} from '@app/helpers/ethereum-message-checker';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
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
  phishingTxRequest: Transaction | null;
  messageIsHex: boolean;
  blindSignEnabled: boolean;
  isAllowedDomain: boolean;
  ethereumSignInMessage: EthereumSignInMessage | null;
  onPressAllowOnceSignDangerousTx: () => void;
}

export const getMessageByRequest = (request: PartialJsonRpcRequest) => {
  switch (request?.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      const ethSignMessage: string = getSignParamsMessage(request.params) || '';
      const original: string = request.params.filter(
        (p: string) => !AddressUtils.isEthAddress(p) && !!p,
      )[0];

      if (isValidJSON(ethSignMessage)) {
        return {
          text: JSON.parse(ethSignMessage),
          json: true,
          original,
        };
      }

      if (ethSignMessage?.startsWith?.('0x')) {
        return {
          text: Buffer.from(ethSignMessage?.slice(2), 'hex').toString('utf8'),
          original,
        };
      }
      return {
        text: ethSignMessage,
        original,
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
  phishingTxRequest,
  messageIsHex,
  blindSignEnabled,
  ethereumSignInMessage,
  onPressAllowOnceSignDangerousTx,
}: WalletConnectSignInfoProps) => {
  const message = useMemo(() => getMessageByRequest(request), [request]);
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);
  const isSupportedCosmosTx = useMemo(
    () => message?.json && isSupportedCosmosTxForRender(message.text),
    [message],
  );

  return (
    <View style={styles.container}>
      <Text variant={TextVariant.t5} i18n={I18N.walletConnectSignSignMessage} />

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
          style={styles.fromImage}
          size={SiteIconPreviewSize.s18}
        />
        <Text variant={TextVariant.t13} color={Color.textGreen1}>
          {url}
        </Text>
      </View>

      <Spacer height={32} />

      <WalletRow hideArrow item={wallet} type={WalletRowTypes.variant2} />

      <Spacer height={12} />

      <First>
        {isSupportedCosmosTx && <TypedDataViewer data={message.text} />}
        <>
          <ScrollView style={styles.json} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBlockContainer}>
              <First>
                {!!ethereumSignInMessage && <></>}
                {!!phishingTxRequest && (
                  <InfoBlock
                    border
                    error
                    icon={
                      <Icon name={IconsName.warning} color={Color.textRed1} />
                    }
                    i18n={I18N.jsonRpcSignPhihsingWarning}
                    bottomContainerStyle={styles.infoBlock}
                  />
                )}
                {!!messageIsHex && (
                  <InfoBlock
                    border
                    warning
                    icon={
                      <Icon
                        name={IconsName.warning}
                        color={Color.textYellow1}
                      />
                    }
                    i18n={I18N.jsonRpcSignBlidSignWarning}
                    bottomContainerStyle={styles.infoBlock}
                    bottom={
                      blindSignEnabled ? null : (
                        <Button
                          i18n={I18N.browserPermissionPromptAllowOnce}
                          variant={ButtonVariant.warning}
                          onPress={onPressAllowOnceSignDangerousTx}
                        />
                      )
                    }
                  />
                )}
              </First>
            </View>

            <Text
              style={styles.messageTitle}
              variant={TextVariant.t9}
              i18n={I18N.walletConnectSignMessage}
            />
            <Spacer height={4} />

            {!!message?.original &&
              !ethereumSignInMessage &&
              (messageIsHex || phishingTxRequest) && (
                <>
                  <Text color={Color.textBase2} style={styles.message} t11>
                    {message.original}
                  </Text>
                  <Spacer height={4} />
                  <Text
                    variant={TextVariant.t10}
                    i18n={I18N.jsonRpcSignParsedMsg}
                  />
                  <Spacer height={4} />
                </>
              )}

            <First>
              {!!phishingTxRequest && (
                <JsonViewer
                  autoexpand={false}
                  style={styles.json}
                  data={phishingTxRequest as Record<string, any>}
                />
              )}
              {!message?.json && (
                <Text
                  color={Color.textBase2}
                  style={styles.message}
                  variant={TextVariant.t11}>
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
            </First>
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
  infoBlock: {
    width: '100%',
  },
  infoBlockContainer: {
    width: '100%',
  },
});
