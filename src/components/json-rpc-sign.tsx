import React from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {JsonRpcSignInfo} from '@app/components/json-rpc-sign-info';
import {JsonRpcTransactionInfo} from '@app/components/json-rpc-transaction-info';
import {Button, ButtonVariant, First, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {getHost} from '@app/helpers/web3-browser-utils';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {JsonRpcMetadata, PartialJsonRpcRequest} from '@app/types';

import {SiteIconPreview, SiteIconPreviewSize} from './site-icon-preview';

export interface WalletConnectSignProps {
  isTransaction: boolean;
  rejectLoading: boolean;
  signLoading: boolean;
  isAllowed: boolean;
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  wallet: Wallet;
  onPressSign(): void;
  onPressReject(): void;
}

export const JsonRpcSign = ({
  isTransaction,
  isAllowed,
  wallet,
  metadata,
  request,
  rejectLoading,
  signLoading,
  onPressReject,
  onPressSign,
}: WalletConnectSignProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <First>
        {isAllowed && (
          <>
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContainer}>
              <Spacer height={32} />

              {isTransaction && (
                <JsonRpcTransactionInfo metadata={metadata} request={request} />
              )}

              {!isTransaction && (
                <JsonRpcSignInfo
                  metadata={metadata}
                  request={request}
                  wallet={wallet!}
                />
              )}
            </ScrollView>

            <View
              style={[styles.buttonContainer, {marginBottom: insets.bottom}]}>
              <Spacer height={4} />
              <Button
                loading={signLoading}
                disabled={rejectLoading}
                variant={ButtonVariant.contained}
                onPress={onPressSign}
                i18n={I18N.walletConnectSignApproveButton}
              />
              <Button
                loading={rejectLoading}
                disabled={signLoading}
                textColor={Color.textRed1}
                onPress={onPressReject}
                i18n={I18N.walletConnectSignRejectButton}
              />
            </View>
          </>
        )}
        {/* TODO: wait for figma */}
        <>
          <Spacer />
          <View>
            <SiteIconPreview
              url={metadata.url}
              directIconUrl={metadata.iconUrl}
              size={SiteIconPreviewSize.s60}
            />
            <Spacer height={10} />
            <Text>
              Domain <Text t12>{getHost(metadata.url)}</Text> not allwed for
              this operation.
            </Text>
          </View>
          <Spacer />
          <View style={[styles.buttonContainer, {marginBottom: insets.bottom}]}>
            <Spacer height={4} />
            <Button
              variant={ButtonVariant.contained}
              loading={rejectLoading}
              disabled={signLoading}
              onPress={onPressReject}
              title={'Close'}
            />
          </View>
        </>
      </First>
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
});
