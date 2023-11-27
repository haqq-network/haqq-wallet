import React, {useEffect, useMemo, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {View, useWindowDimensions} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {Spacer} from '@app/components/ui';
import {WalletCard} from '@app/components/wallet-card';
import {WalletCreate} from '@app/components/wallet-create';
import {CarouselItem} from '@app/components/wallets/carousel-item';
import {Dot} from '@app/components/wallets/dot';
import {Plus} from '@app/components/wallets/plus';
import {createTheme} from '@app/helpers';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {WalletBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export type WalletsProps = {
  wallets: Wallet[];
  balance: WalletBalance;
  showLockedTokens: boolean;
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressWalletConnect: (address: string) => void;
  onPressProtection: (wallet: Wallet) => void;
  onPressCreate: () => void;
  onPressLedger: () => void;
  onPressRestore: () => void;
  onPressAccountInfo: (address: string) => void;
  testID?: string;
};

export const Wallets = ({
  balance,
  wallets,
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
  const {activeSessions} = useWalletConnectSessions();
  const [walletConnectSessions, setWalletConnectSessions] = useState<
    SessionTypes.Struct[][]
  >([]);

  useEffect(() => {
    setWalletConnectSessions(
      wallets.map(wallet =>
        filterWalletConnectSessionsByAddress(activeSessions, wallet.address),
      ),
    );
  }, [wallets, activeSessions]);

  const userHaveSSSProtectedWallets = useMemo(
    () =>
      !!wallets.find(_w => _w.type === WalletType.sss && _w.socialLinkEnabled)
        ?.accountId,
    [wallets],
  );

  return (
    <>
      <Spacer height={12} />
      <Animated.ScrollView
        testID={testID}
        pagingEnabled
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        style={styles.scroll}>
        {wallets.map((w, i) => {
          const isSecondMnemonic =
            w.type === WalletType.mnemonic && userHaveSSSProtectedWallets;

          return (
            <CarouselItem index={i} pan={pan} key={w.address}>
              <WalletCard
                testID={`${testID}_${w.address}`}
                wallet={w}
                balance={balance[w.address]}
                walletConnectSessions={walletConnectSessions[i]}
                showLockedTokens={showLockedTokens}
                onPressSend={onPressSend}
                onPressQR={onPressQR}
                onPressProtection={onPressProtection}
                onPressWalletConnect={onPressWalletConnect}
                onPressAccountInfo={onPressAccountInfo}
                isSecondMnemonic={isSecondMnemonic}
              />
            </CarouselItem>
          );
        })}
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
