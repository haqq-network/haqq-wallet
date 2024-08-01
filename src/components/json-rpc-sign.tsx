import React, {useCallback, useMemo, useState} from 'react';

import {Transaction} from 'ethers';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {JsonRpcSignInfo} from '@app/components/json-rpc-sign-info';
import {JsonRpcTransactionInfo} from '@app/components/json-rpc-transaction-info';
import {Button, ButtonVariant, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {EthereumSignInMessage} from '@app/helpers/ethereum-message-checker';
import {I18N} from '@app/i18n';
import {Fee} from '@app/models/fee';
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
  phishingTxRequest: Transaction | null;
  messageIsHex: boolean;
  blindSignEnabled: boolean;
  ethereumSignInMessage: EthereumSignInMessage | null;
  onPressSign(fee?: Fee | null): void;
  onPressReject(): void;
  onPressAllowOnceSignDangerousTx(): void;
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
  phishingTxRequest,
  messageIsHex,
  blindSignEnabled,
  ethereumSignInMessage,
  onPressReject,
  onPressSign,
  onPressAllowOnceSignDangerousTx,
}: JsonRpcSignProps) => {
  const insets = useSafeAreaInsets();

  const [fee, setFee] = useState<Fee | null>(null);

  const signButtonDisabled = useMemo(() => {
    if (rejectLoading || !isAllowedDomain) {
      return true;
    }

    if (ethereumSignInMessage && Object.values(ethereumSignInMessage).length) {
      return false;
    }

    if (messageIsHex && blindSignEnabled === false) {
      return true;
    }

    if (phishingTxRequest && Object.values(phishingTxRequest).length) {
      return true;
    }

    return false;
  }, [
    blindSignEnabled,
    messageIsHex,
    phishingTxRequest,
    rejectLoading,
    isAllowedDomain,
  ]);

  const handleSignPress = useCallback(() => {
    onPressSign(fee);
  }, [fee]);

  return (
    <View style={styles.container}>
      <View style={styles.txContainer}>
        {isTransaction && (
          <JsonRpcTransactionInfo
            metadata={metadata}
            request={request}
            chainId={chainId}
            verifyAddressResponse={verifyAddressResponse}
            hideContractAttention={hideContractAttention}
            fee={fee}
            setFee={setFee}
          />
        )}

        {!isTransaction && (
          <JsonRpcSignInfo
            metadata={metadata}
            request={request}
            wallet={wallet!}
            phishingTxRequest={phishingTxRequest}
            messageIsHex={messageIsHex}
            blindSignEnabled={blindSignEnabled}
            isAllowedDomain={isAllowedDomain}
            ethereumSignInMessage={ethereumSignInMessage}
            onPressAllowOnceSignDangerousTx={onPressAllowOnceSignDangerousTx}
          />
        )}
      </View>

      <View style={[styles.buttonContainer, {marginBottom: insets.bottom}]}>
        <Spacer height={4} />
        <Button
          loading={signLoading}
          disabled={signButtonDisabled}
          variant={ButtonVariant.contained}
          onPress={handleSignPress}
          i18n={I18N.walletConnectSignApproveButton}
          testID={'wc-sign'}
        />
        <Button
          loading={rejectLoading}
          disabled={signLoading}
          textColor={Color.textRed1}
          onPress={onPressReject}
          i18n={I18N.walletConnectSignRejectButton}
          testID={'wc-reject'}
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
  txContainer: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
});
