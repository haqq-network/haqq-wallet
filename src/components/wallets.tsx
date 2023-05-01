import React, {useRef} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {Animated, ScrollView, View, useWindowDimensions} from 'react-native';
import {Results} from 'realm';

import {Color} from '@app/colors';
import {Banners} from '@app/components/banners/banners';
import {CarouselItem} from '@app/components/carousel-item';
import {HomeBannerProps} from '@app/components/home-banner';
import {Icon, Text} from '@app/components/ui';
import {WalletCard} from '@app/components/wallet-card';
import {WalletCreate} from '@app/components/wallet-create';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Banner} from '@app/models/banner';
import {Wallet} from '@app/models/wallet';

export type WalletsProps = {
  wallets: Wallet[];
  balance: Record<string, number>;
  banners: Results<Banner>;
  walletConnectSessions: SessionTypes.Struct[][];
  onPressSend: (address: string) => void;
  onPressQR: (address: string) => void;
  onWalletConnectPress: (address: string) => void;
  onPressProtection: (address: string) => void;
  onPressCreate: () => void;
  onPressLedger: () => void;
  onPressRestore: () => void;
  onPressBanner: HomeBannerProps['onPress'];
  onPressAccountInfo: (address: string) => void;
};
export const Wallets = ({
  balance,
  wallets,
  banners,
  walletConnectSessions,
  onPressSend,
  onPressQR,
  onPressCreate,
  onPressLedger,
  onPressProtection,
  onPressRestore,
  onWalletConnectPress,
  onPressBanner,
  onPressAccountInfo,
}: WalletsProps) => {
  const screenWidth = useWindowDimensions().width;

  const pan = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <ScrollView
        pagingEnabled
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={({nativeEvent}) => {
          pan.setValue(nativeEvent.contentOffset.x / screenWidth);
        }}
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}>
        {wallets.map((w, i) => (
          <CarouselItem index={i} pan={pan} key={w.address}>
            <WalletCard
              wallet={w}
              balance={balance[w.address] ?? 0}
              walletConnectSessions={walletConnectSessions[i]}
              onPressSend={onPressSend}
              onPressQR={onPressQR}
              onPressProtection={onPressProtection}
              onWalletConnectPress={onWalletConnectPress}
              onPressAccountInfo={onPressAccountInfo}
            />
          </CarouselItem>
        ))}
        <CarouselItem index={wallets.length} pan={pan}>
          <WalletCreate
            onPressCreate={onPressCreate}
            onPressLedger={onPressLedger}
            onPressRestore={onPressRestore}
          />
        </CarouselItem>
      </ScrollView>
      <View style={styles.sub}>
        {wallets.map((w, i) => (
          <Animated.View
            key={w.address}
            style={[
              styles.animateViewList,
              {
                opacity: pan.interpolate({
                  inputRange: [i - 1, i, i + 1],
                  outputRange: [0.5, 1, 0.5],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        ))}
        <Animated.View
          style={[
            styles.animateView,
            {
              opacity: pan.interpolate({
                inputRange: [wallets.length - 1, wallets.length],
                outputRange: [0.5, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}>
          <Icon i12 name="plus_mid" color={Color.graphicBase1} />
        </Animated.View>
      </View>
      <Banners banners={banners} onPressBanner={onPressBanner} />
      <Text t6 i18n={I18N.transactions} style={styles.t6} />
    </View>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 24,
  },
  scroll: {overflow: 'hidden'},
  scrollInner: {paddingBottom: 24, paddingTop: 6},
  sub: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: -20,
  },
  animateViewList: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 3,
    backgroundColor: Color.graphicBase1,
  },
  animateView: {
    width: 12,
    height: 12,
  },
  t6: {
    marginVertical: 12,
    textAlign: 'left',
    paddingHorizontal: 20,
    color: Color.textBase1,
  },
});
