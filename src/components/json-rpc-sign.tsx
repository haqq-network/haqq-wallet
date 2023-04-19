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
import {JsonRpcMetadata, PartialJsonRpcRequest} from '@app/types';

export interface WalletConnectSignProps {
  isTransaction: boolean;
  request: PartialJsonRpcRequest;
  metadata: JsonRpcMetadata;
  wallet: Wallet;

  onPressSign(): void;

  onPressReject(): void;
}

export const JsonRpcSign = ({
  isTransaction,
  onPressSign,
  onPressReject,
  wallet,
  metadata,
  request,
}: WalletConnectSignProps) => {
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

      <View style={[styles.buttonContainer, {marginBottom: insets.bottom}]}>
        <Spacer height={4} />
        <Button
          variant={ButtonVariant.contained}
          onPress={onPressSign}
          i18n={I18N.walletConnectSignApproveButton}
        />
        <Button
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
