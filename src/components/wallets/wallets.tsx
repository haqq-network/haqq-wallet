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
import {AddressUtils} from '@app/helpers/address-utils';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {VariablesString} from '@app/models/variables-string';
import {IWalletModel, Wallet, WalletBalance} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export type WalletsProps = {
  wallets: IWalletModel[];
  balance: WalletBalance;
  showLockedTokens: boolean;
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onPressWalletConnect: (address: string) => void;
  onPressProtection: (wallet: IWalletModel) => void;
  onPressCreate: () => void;
  onPressHardwareWallet: () => void;
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
  onPressHardwareWallet,
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
  const mnemonicCache: string[] = [];

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
        style={styles.scroll}
        contentContainerStyle={styles.content}>
        {wallets.map((w, i) => {
          let isSecondMnemonic =
            w.isImported ||
            mnemonicCache.length > 1 ||
            (w.type === WalletType.mnemonic && userHaveSSSProtectedWallets);

          if (
            w.type === WalletType.mnemonic &&
            w.accountId &&
            !mnemonicCache.includes(w.accountId)
          ) {
            mnemonicCache.push(w.accountId);
            isSecondMnemonic =
              w.isImported ||
              mnemonicCache.length > 1 ||
              (w.type === WalletType.mnemonic && userHaveSSSProtectedWallets);
          }

          if (w.accountId === mnemonicCache[0] && mnemonicCache.length > 1) {
            isSecondMnemonic = false;
          }

          if (w.type === WalletType.sss) {
            isSecondMnemonic = false;
          }

          if (
            w.type === WalletType.mnemonic &&
            w.accountId &&
            !VariablesString.get('rootMnemonicAccountId')
          ) {
            VariablesString.set('rootMnemonicAccountId', w.accountId);
            isSecondMnemonic = false;
          }

          if (
            w.type === WalletType.mnemonic &&
            VariablesString.get('rootMnemonicAccountId') === w.accountId
          ) {
            isSecondMnemonic = false;
          }

          if (w.type === WalletType.mnemonic && userHaveSSSProtectedWallets) {
            isSecondMnemonic = true;
          }

          if (isSecondMnemonic && !w.isImported) {
            Wallet.update(w.address, {isImported: true});
          }

          return (
            <CarouselItem index={i} pan={pan} key={w.address}>
              <WalletCard
                testID={`${testID}_${w.address}`}
                wallet={w}
                balance={balance[AddressUtils.toEth(w.address)]}
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
            onPressHardwareWallet={onPressHardwareWallet}
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
  content: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  scroll: {
    overflow: 'hidden',
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
