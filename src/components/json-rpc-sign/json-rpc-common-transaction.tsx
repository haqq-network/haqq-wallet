import React, {useCallback, useMemo, useState} from 'react';

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
  Loading,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N} from '@app/i18n';
import {Contract} from '@app/models/contract';
import {Fee} from '@app/models/fee';
import {ProviderModel} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Balance} from '@app/services/balance';
import {
  AddressWallet,
  ChainId,
  IToken,
  JsonRpcMetadata,
  JsonRpcTransactionRequest,
} from '@app/types';
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
  chainId: ChainId;
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
  chainId,
  onFeePress,
}: JsonRpcCommonTransactionProps) => {
  const url = useMemo(() => getHostnameFromUrl(metadata?.url), [metadata]);
  const [token, setToken] = useState(Token.getById(tx?.to!));
  const value = useMemo(() => {
    if (['delegate', 'undelegate'].includes(functionName!)) {
      return new Balance(
        parsedInput?.args?.[2] || '0x0',
        provider?.decimals!,
        provider?.denom!,
      );
    }
    if (functionName === 'redelegate') {
      return new Balance(
        parsedInput?.args?.[3] || '0x0',
        provider?.decimals!,
        provider?.denom!,
      );
    }

    if (functionName === 'approve') {
      const t = token || Token.UNKNOWN_TOKEN;
      return new Balance(
        parsedInput?.args?.[1] || '0x0',
        t.decimals!,
        t.symbol!,
      );
    }

    if (!tx?.value) {
      return new Balance(0, provider?.decimals, provider?.denom);
    }

    return new Balance(tx.value, provider?.decimals, provider?.denom);
  }, [tx, provider, parsedInput]);

  const to = useMemo(() => {
    return tx?.to ? shortAddress(tx.to, '•') : '';
  }, [tx]);

  const delegatorAddress = useMemo(() => {
    if (['delegate', 'undelegate'].includes(functionName!)) {
      return parsedInput?.args?.[1];
    }
    if (functionName === 'redelegate') {
      return parsedInput?.args?.[2];
    }
    return '';
  }, [functionName, parsedInput]);

  const total = useMemo(() => {
    if (functionName === 'approve') {
      return fee?.calculatedFees?.expectedFee.toBalanceString('auto');
    }

    const expectedFee =
      fee?.calculatedFees?.expectedFee ||
      new Balance(0, provider?.decimals, provider?.denom);

    const expectedFeeHex = expectedFee.toHex();
    const valueHex = value.toHex();
    const totalHex = ethers.BigNumber.from(valueHex).add(expectedFeeHex);

    return new Balance(
      totalHex,
      provider?.decimals,
      provider?.denom,
    ).toBalanceString(4);
  }, [value, fee]);

  const onPressToAddress = useCallback(() => {
    openInAppBrowser(provider?.getAddressExplorerUrl?.(tx?.to!)!);
  }, [provider, tx]);

  const onPressApproveSpender = useCallback(() => {
    openInAppBrowser(
      provider?.getAddressExplorerUrl?.(parsedInput?.args?.[0])!,
    );
  }, [provider, tx, parsedInput]);

  const onPressDelegatorAddress = useCallback(() => {
    // TODO: add to provider config
    const pingPubUrl = provider?.config.explorerCosmosTxUrl.replace(
      /tx\/.*/,
      `staking/${delegatorAddress}`,
    );

    if (!pingPubUrl) {
      return;
    }

    openInAppBrowser(pingPubUrl);
  }, [provider, parsedInput, delegatorAddress]);

  useEffectAsync(async () => {
    const contract = await Contract.getById(tx?.to! as AddressWallet, chainId);
    const t = contract ?? Token.UNKNOWN_TOKEN;
    setToken(t as unknown as IToken);
  }, [tx, chainId]);

  if (functionName === 'approve' && !token) {
    return <Loading />;
  }

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
        {to}
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
        {!!delegatorAddress && (
          <DataView i18n={I18N.stakingInfo}>
            <Text
              variant={TextVariant.t11}
              color={Color.textGreen1}
              onPress={onPressDelegatorAddress}>
              {shortAddress(delegatorAddress, '•')}
            </Text>
          </DataView>
        )}
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
        {functionName !== 'claimRewards' && (
          <DataView i18n={I18N.transactionInfoAmount}>
            <Text
              variant={TextVariant.t11}
              color={Color.textBase1}
              children={value.toBalanceString('auto')}
            />
          </DataView>
        )}
        <DataView i18n={I18N.transactionInfoNetworkFee}>
          <First>
            {isFeeLoading && <ActivityIndicator />}
            <TouchableWithoutFeedback
              disabled={provider?.isTron}
              onPress={onFeePress}>
              <View style={styles.feeContainer}>
                <Text
                  variant={TextVariant.t11}
                  color={provider?.isTron ? Color.textBase1 : Color.textGreen1}>
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
