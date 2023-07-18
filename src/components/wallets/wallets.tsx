import React from 'react';

import {SessionTypes} from '@walletconnect/types';
import {View} from 'react-native';
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
import {Wallet} from '@app/models/wallet';
import {WINDOW_WIDTH} from '@app/variables/common';

export type WalletsProps = {
  wallets: Wallet[] | Results<Wallet>;
  balance: Record<string, number>;
  walletConnectSessions: SessionTypes.Struct[][];
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
  walletConnectSessions,
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

  const scrollHandler = useAnimatedScrollHandler(event => {
    pan.value = event.contentOffset.x / WINDOW_WIDTH;
  });

  return (
    <>
      <Spacer height={24} />
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
              balance={balance[w.address] ?? 0}
              walletConnectSessions={walletConnectSessions[i]}
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
