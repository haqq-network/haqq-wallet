import React from 'react';

import {SessionTypes} from '@walletconnect/types';
import {View, useWindowDimensions} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {Results} from 'realm';

import {Spacer} from '@app/components/ui';
import {WalletCard} from '@app/components/wallet-card';
import {WalletCreate} from '@app/components/wallet-create';
import {CarouselItem} from '@app/components/wallets/carousel-item';
import {Dot} from '@app/components/wallets/dot';
import {Plus} from '@app/components/wallets/plus';
import {createTheme} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {WalletBalance} from '@app/hooks/use-wallets-balance';
import {WalletStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {WalletVestingBalance} from '@app/hooks/use-wallets-vesting-balance';
import {Wallet} from '@app/models/wallet';

export type WalletsProps = {
  wallets: Wallet[] | Results<Wallet>;
  balance: WalletBalance;
  stakingBalance: WalletStakingBalance;
  vestingBalance: WalletVestingBalance;
  walletConnectSessions: SessionTypes.Struct[][];
  showLockedTokens: boolean;
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressWalletConnect: (address: string) => void;
  onPressProtection: (address: string) => void;
  onPressCreate: () => void;
  onPressLedger: () => void;
  onPressRestore: () => void;
  onPressAccountInfo: (address: string) => void;
  testID?: string;
};

export const Wallets = ({
  balance,
  wallets,
  stakingBalance,
  vestingBalance,
  walletConnectSessions,
  showLockedTokens,
  onPressSend,
  onPressQR,
  onPressCreate,
  onPressLedger,
  onPressProtection,
  onPressRestore,
  onPressWalletConnect,
  onPressAccountInfo,
  testID,
}: WalletsProps) => {
  const pan = useSharedValue(0);
  const dimensions = useWindowDimensions();
  const scrollHandler = useAnimatedScrollHandler(
    event => {
      pan.value = event.contentOffset.x / dimensions.width;
    },
    [dimensions],
  );

  return (
    <>
      <Spacer
        height={isFeatureEnabled(Feature.lockedStakedVestedTokens) ? 12 : 24}
      />
      <Animated.ScrollView
        pagingEnabled
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        style={styles.scroll}>
        {wallets.map((w, i) => (
          <CarouselItem index={i} pan={pan} key={w.address}>
            <WalletCard
              testID={`${testID}_${w.address}`}
              wallet={w}
              balance={balance[w.address]}
              stakingBalance={stakingBalance[w.address]}
              vestingBalance={vestingBalance[w.address]}
              walletConnectSessions={walletConnectSessions[i]}
              showLockedTokens={showLockedTokens}
              onPressSend={onPressSend}
              onPressQR={onPressQR}
              onPressProtection={onPressProtection}
              onPressWalletConnect={onPressWalletConnect}
              onPressAccountInfo={onPressAccountInfo}
            />
          </CarouselItem>
        ))}
        <CarouselItem index={wallets.length} pan={pan}>
          <WalletCreate
            testID={`${testID}_create`}
            onPressCreate={onPressCreate}
            onPressLedger={onPressLedger}
            onPressRestore={onPressRestore}
          />
        </CarouselItem>
      </Animated.ScrollView>
      <Spacer height={9} />
      <View style={styles.sub}>
        {wallets.map((w, i) => (
          <Dot pan={pan} index={i} key={w.address} />
        ))}
        <Plus pan={pan} index={wallets.length} />
      </View>
    </>
  );
};

const styles = createTheme({
  scroll: {overflow: 'hidden'},
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
