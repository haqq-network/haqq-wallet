import React from 'react';

import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {JsonRpcSignInfo} from '@app/components/json-rpc-sign-info';
import {JsonRpcTransactionInfo} from '@app/components/json-rpc-transaction-info';
import {Button, ButtonVariant, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  JsonRpcMetadata,
  PartialJsonRpcRequest,
  VerifyAddressResponse,
} from '@app/types';

export interface JsonRpcSignProps {
  isTransaction: boolean;
  rejectLoading: boolean;
  signLoading: boolean;
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  wallet: Wallet;
  verifyAddressResponse: VerifyAddressResponse | null;
  chainId?: number;
  hideContractAttention?: boolean;
  isAllowedDomain: boolean;
  onPressSign(): void;

  onPressReject(): void;
}

export const JsonRpcSign = ({
  isTransaction,
  wallet,
  metadata,
  request,
  rejectLoading,
  signLoading,
  verifyAddressResponse,
  hideContractAttention,
  chainId,
  isAllowedDomain,
  onPressReject,
  onPressSign,
}: JsonRpcSignProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        <Spacer height={32} />

        {isTransaction && (
          <JsonRpcTransactionInfo
            metadata={metadata}
            request={request}
            chainId={chainId}
            verifyAddressResponse={verifyAddressResponse}
            hideContractAttention={hideContractAttention}
          />
        )}

        {!isTransaction && (
          <JsonRpcSignInfo
            metadata={metadata}
            request={request}
            wallet={wallet!}
          />
        )}
      </ScrollView>

      <View style={[styles.buttonContainer, {marginBottom: insets.bottom}]}>
        <Spacer height={4} />
        <Button
          loading={signLoading}
          disabled={rejectLoading || !isAllowedDomain}
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
