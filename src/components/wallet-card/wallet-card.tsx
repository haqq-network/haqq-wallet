import React, {useMemo, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import {Card, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useIsBalancesFirstSync} from '@app/hooks/use-is-balances-sync';
import {BalanceModel, IWalletModel} from '@app/models/wallet';
import {SHADOW_L} from '@app/variables/shadows';

import {BalanceInfoDetails} from './balance-info-details';
import {BalanceInfoTotal} from './balance-info-total';
import {CardButtons} from './card-buttons';
import {CardName} from './card-name';
import {ProtectionBadge} from './protection-badge';

export type BalanceProps = {
  testID?: string;
  wallet: IWalletModel;
  balance?: BalanceModel;
  showLockedTokens: boolean;
  walletConnectSessions: SessionTypes.Struct[];
  onPressAccountInfo: (address: string) => void;
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressProtection: (wallet: IWalletModel) => void;
  onPressWalletConnect?: (address: string) => void;
  isSecondMnemonic: boolean;
};

export const WalletCard = ({
  testID,
  wallet,
  walletConnectSessions,
  showLockedTokens,
  onPressSend,
  onPressQR,
  onPressWalletConnect,
  onPressProtection,
  onPressAccountInfo,
  balance,
  isSecondMnemonic,
}: BalanceProps) => {
  const {locked, total} = balance ?? {};
  const [cardState, setCardState] = useState('loading');
  const {isBalanceLoadingError, isBalancesFirstSync} = useIsBalancesFirstSync();
  const screenWidth = useWindowDimensions().width;

  const showPlaceholder = useMemo(() => {
    if (isBalancesFirstSync) {
      return true;
    }

    if (isBalanceLoadingError) {
      return !total?.isPositive();
    }

    return false;
  }, [isBalanceLoadingError, isBalancesFirstSync]);

  const onAccountInfo = () => {
    onPressAccountInfo(wallet?.address);
  };

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
        isBalancesFirstSync={showPlaceholder}
        testID={testID}
        wallet={wallet}
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
        onPress={onAccountInfo}>
        <View>
          <BalanceInfoTotal
            isBalancesFirstSync={showPlaceholder}
            total={total}
          />
          <BalanceInfoDetails
            isBalancesFirstSync={showPlaceholder}
            showLockedTokens={showLockedTokens}
            total={total}
            locked={locked}
          />
        </View>
      </TouchableWithoutFeedback>
      <Spacer height={12} />
      <CardButtons
        testID={testID}
        wallet={wallet}
        cardState={cardState}
        onPressQR={onPressQR}
        onPressSend={onPressSend}
      />
    </Card>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    ...SHADOW_L,
  },
});
