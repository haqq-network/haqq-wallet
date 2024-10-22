import React, {useCallback, useMemo} from 'react';

import {ethers} from 'ethers';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {
  DataView,
  First,
  Icon,
  IconsName,
  InfoBlock,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Fee} from '@app/models/fee';
import {ProviderModel} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Balance} from '@app/services/balance';
import {JsonRpcMetadata, JsonRpcTransactionRequest} from '@app/types';
import {getHostnameFromUrl, openInAppBrowser} from '@app/utils';
import {STRINGS} from '@app/variables/common';

import {SiteIconPreview, SiteIconPreviewSize} from '../site-icon-preview';

export interface JsonRpcCommonTransactionProps {
  metadata: JsonRpcMetadata;
  showSignContratAttention: boolean;
  functionName?: string;
  isContract: boolean;
  provider: ProviderModel | undefined;
  isFeeLoading: boolean;
  fee: Fee | null | undefined;
  tx: Partial<JsonRpcTransactionRequest> | undefined;
  parsedInput: ethers.utils.TransactionDescription | undefined;

  onFeePress: () => void;
}

export const JsonRpcCommonTransaction = ({
  metadata,
  showSignContratAttention,
  functionName,
  isContract,
  provider,
  isFeeLoading,
  fee,
  tx,
  parsedInput,
  onFeePress,
}: JsonRpcCommonTransactionProps) => {
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);
  const value = useMemo(() => {
    if (functionName === 'approve') {
      const token = Token.getById(tx?.to!) || Token.UNKNOWN_TOKEN;
      return new Balance(
        parsedInput?.args?.[1] || '0x0',
        token.decimals!,
        token.symbol!,
      );
    }

    if (!tx?.value) {
      return Balance.Empty;
    }

    return new Balance(tx.value, provider?.decimals, provider?.denom);
  }, [tx, provider, parsedInput]);

  const total = useMemo(() => {
    if (functionName === 'approve') {
      return fee?.calculatedFees?.expectedFee.toBalanceString('auto');
    }
    return value
      .operate(fee?.calculatedFees?.expectedFee ?? Balance.Empty, 'add')
      .toBalanceString('auto');
  }, [value, fee?.calculatedFees?.expectedFee]);

  const onPressToAddress = useCallback(() => {
    openInAppBrowser(provider?.getAddressExplorerUrl?.(tx?.to!)!);
  }, [provider, tx]);

  const onPressApproveSpender = useCallback(() => {
    openInAppBrowser(
      provider?.getAddressExplorerUrl?.(parsedInput?.args?.[0])!,
    );
  }, [provider, tx, parsedInput]);

  return (
    <View style={styles.container}>
      <Text
        variant={TextVariant.t5}
        i18n={I18N.walletConnectSignTransactionForSignature}
      />

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
          size={SiteIconPreviewSize.s18}
          style={styles.fromImage}
        />
        <Text variant={TextVariant.t13} color={Color.textGreen1}>
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

      {functionName !== 'approve' && (
        <>
          <Text
            variant={TextVariant.t11}
            color={Color.textBase2}
            i18n={I18N.walletConnectSignTotalAmount}
          />

          <Spacer height={4} />
          <Text variant={TextVariant.t3}>{total}</Text>

          <Spacer height={16} />
        </>
      )}

      <Text
        variant={TextVariant.t11}
        color={Color.textBase2}
        i18n={I18N.walletConnectSignSendTo}
      />

      <Spacer height={4} />

      <Text
        onPress={onPressToAddress}
        variant={TextVariant.t10}
        selectable
        color={Color.textBase1}>
        {tx?.to}
      </Text>

      <Spacer height={28} />

      <ScrollView
        style={styles.info}
        contentContainerStyle={styles.infoContentContainer}
        showsVerticalScrollIndicator={false}>
        <DataView i18n={I18N.transactionInfoTypeOperation}>
          <Text variant={TextVariant.t11} color={Color.textBase1}>
            {functionName?.length ? (
              <Text children={functionName} />
            ) : (
              <Text
                i18n={
                  isContract
                    ? I18N.transactionInfoContractInteraction
                    : I18N.transactionInfoSendingFunds
                }
              />
            )}
          </Text>
        </DataView>
        {functionName === 'approve' && (
          <DataView i18n={I18N.transactionDetailApproveSpenderTitle}>
            <Text
              onPress={onPressApproveSpender}
              variant={TextVariant.t11}
              color={Color.textGreen1}>
              {Token.getById(parsedInput?.args?.[0])?.name ?? ''}
              {STRINGS.NBSP}
              {shortAddress(parsedInput?.args?.[0], '•', true)}
            </Text>
          </DataView>
        )}
        {!!provider?.id && (
          <DataView i18n={I18N.transactionInfoNetwork}>
            <Text variant={TextVariant.t11} color={Color.textBase1}>
              {provider.name}
            </Text>
          </DataView>
        )}
        <DataView i18n={I18N.transactionInfoAmount}>
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            children={value.toBalanceString('auto')}
          />
        </DataView>
        <DataView i18n={I18N.transactionInfoNetworkFee}>
          <First>
            {isFeeLoading && <ActivityIndicator />}
            <TouchableWithoutFeedback
              disabled={provider?.isTron}
              onPress={onFeePress}>
              <View style={styles.feeContainer}>
                <Text variant={TextVariant.t11} color={Color.textGreen1}>
                  {provider?.isTron
                    ? fee?.expectedFee?.toBalanceString()
                    : fee?.expectedFeeString}
                </Text>
                {(provider?.isEVM || provider?.isHaqqNetwork) && (
                  <Icon name={IconsName.tune} color={Color.textGreen1} />
                )}
              </View>
            </TouchableWithoutFeedback>
          </First>
        </DataView>
      </ScrollView>
      <Spacer height={10} />
    </View>
  );
};

const styles = createTheme({
  info: {
    width: '100%',
    flex: 1,
  },
  infoContentContainer: {
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
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  feeContainer: {
    flexDirection: 'row',
  },
});
