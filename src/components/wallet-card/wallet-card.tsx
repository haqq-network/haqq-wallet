import React, {useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {observer} from 'mobx-react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import {Color} from '@app/colors';
import {
  Card,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {BalanceModel, Wallet, WalletModel} from '@app/models/wallet';
import {addOpacityToColor} from '@app/utils';
import {SHADOW_L} from '@app/variables/shadows';

import {BalanceInfoDetails} from './balance-info-details';
import {BalanceInfoTotal} from './balance-info-total';
import {CardButtons} from './card-buttons';
import {CardName} from './card-name';
import {ProtectionBadge} from './protection-badge';

export type BalanceProps = {
  testID?: string;
  wallet: WalletModel;
  balance?: BalanceModel;
  showLockedTokens: boolean;
  walletConnectSessions: SessionTypes.Struct[];
  onPressAccountInfo: (address: string) => void;
  onPressSend: (address: string) => void;
  onPressReceive: (address: string) => void;
  onPressProtection: (wallet: WalletModel) => void;
  onPressWalletConnect?: (address: string) => void;
  isSecondMnemonic: boolean;
};

export const WalletCard = observer(
  ({
    testID,
    wallet,
    walletConnectSessions,
    showLockedTokens,
    onPressSend,
    onPressReceive,
    onPressWalletConnect,
    onPressProtection,
    onPressAccountInfo,
    balance,
    isSecondMnemonic,
  }: BalanceProps) => {
    const {locked, total} = balance ?? {};
    const [cardState, setCardState] = useState('loading');
    const screenWidth = useWindowDimensions().width;

    const onAccountInfo = () => {
      onPressAccountInfo(wallet?.address);
    };

    const isBalanceLoading = Wallet.checkWalletBalanceLoading(wallet);

    return (
      <Card
        testID={`${testID}_card`}
        colorFrom={wallet?.colorFrom}
        colorTo={wallet?.colorTo}
        colorPattern={wallet?.colorPattern}
        pattern={wallet?.pattern}
        style={styles.container}
        width={screenWidth - 40}
        onLoad={() => {
          setCardState('laded');
        }}>
        <CardName
          onAccountInfo={onAccountInfo}
          testID={testID}
          wallet={wallet}
          isBalanceLoading={isBalanceLoading}
        />
        <ProtectionBadge
          wallet={wallet}
          isSecondMnemonic={isSecondMnemonic}
          walletConnectSessions={walletConnectSessions}
          onPressProtection={onPressProtection}
          onPressWalletConnect={onPressWalletConnect}
        />
        <TouchableWithoutFeedback
          testID="accountInfoButton"
          disabled={isBalanceLoading}
          onPress={onAccountInfo}>
          <View>
            <BalanceInfoTotal
              total={total}
              isBalanceLoading={isBalanceLoading}
            />
            <BalanceInfoDetails
              showLockedTokens={showLockedTokens}
              total={total}
              locked={locked}
              isBalanceLoading={isBalanceLoading}
            />
          </View>
        </TouchableWithoutFeedback>
        <Spacer height={12} />
        <CardButtons
          testID={testID}
          wallet={wallet}
          cardState={cardState}
          onPressReceive={onPressReceive}
          onPressSend={onPressSend}
          isBalanceLoading={isBalanceLoading}
        />
        {/* TODO: add tron support */}
        {Provider.selectedProvider.isTron && !wallet.isSupportTron && (
          <View style={styles.tronNotSupportContainer}>
            <Text
              color={Color.textBase3}
              variant={TextVariant.t10}
              position={TextPosition.center}
              i18n={I18N.tronNotSupportedYet}
            />
          </View>
        )}
      </Card>
    );
  },
);

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    ...SHADOW_L,
  },
  tronNotSupportContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: addOpacityToColor(Color.graphicGreen2, 0.9),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    borderRadius: 12,
  },
});
