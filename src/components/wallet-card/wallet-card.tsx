import React, {useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {useWindowDimensions} from 'react-native';

import {Card, Spacer} from '@app/components/ui';
import {useIsBalancesFirstSync} from '@app/hooks/use-is-balances-sync';
import {Wallet} from '@app/models/wallet';
import {Color, createTheme} from '@app/theme';
import {BalanceData} from '@app/types';
import {SHADOW_COLOR_1} from '@app/variables/common';

import {BalanceInfoDetails} from './balance-info-details';
import {BalanceInfoTotal} from './balance-info-total';
import {CardButtons} from './card-buttons';
import {CardName} from './card-name';
import {ProtectionBadge} from './protection-badge';

export type BalanceProps = {
  testID?: string;
  wallet: Wallet;
  balance?: BalanceData;
  showLockedTokens: boolean;
  walletConnectSessions: SessionTypes.Struct[];
  onPressAccountInfo: (address: string) => void;
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressProtection: (wallet: Wallet) => void;
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
  const isBalancesFirstSync = useIsBalancesFirstSync();
  const screenWidth = useWindowDimensions().width;

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
        isBalancesFirstSync={isBalancesFirstSync}
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
      <BalanceInfoTotal
        isBalancesFirstSync={isBalancesFirstSync}
        total={total}
        onAccountInfo={onAccountInfo}
      />
      <BalanceInfoDetails
        isBalancesFirstSync={isBalancesFirstSync}
        showLockedTokens={showLockedTokens}
        total={total}
        locked={locked}
        onAccountInfo={onAccountInfo}
      />
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
    backgroundColor: Color.bg1,
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
  },
});
