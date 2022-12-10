import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Animated, ScrollView, View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {CarouselItem} from '@app/components/carousel-item';
import {Icon, Text} from '@app/components/ui';
import {WalletCard} from '@app/components/wallet-card';
import {WalletCreate} from '@app/components/wallet-create';
import {createTheme} from '@app/helpers';
import {useWallets} from '@app/hooks';
import {I18N} from '@app/i18n';

export const Wallets = () => {
  const wallets = useWallets();
  const [visibleRows, setVisibleRows] = useState(wallets.visible);
  const screenWidth = useWindowDimensions().width;

  const pan = useRef(new Animated.Value(0)).current;

  const updateWallets = useCallback(() => {
    setVisibleRows(wallets.visible);
  }, [wallets]);

  useEffect(() => {
    wallets.on('wallets', updateWallets);

    return () => {
      wallets.off('wallets', updateWallets);
    };
  }, [updateWallets, wallets]);

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
        {visibleRows.map((w, i) => (
          <CarouselItem index={i} pan={pan} key={w.address}>
            <WalletCard address={w.address} />
          </CarouselItem>
        ))}
        <CarouselItem index={visibleRows.length} pan={pan}>
          <WalletCreate />
        </CarouselItem>
      </ScrollView>
      <View style={styles.sub}>
        {visibleRows.map((w, i) => (
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
                inputRange: [wallets.getSize() - 1, wallets.getSize()],
                outputRange: [0.5, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}>
          <Icon i12 name="plus_mid" color={Color.graphicBase1} />
        </Animated.View>
      </View>
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
