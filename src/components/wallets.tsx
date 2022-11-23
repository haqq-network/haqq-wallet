import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Animated, Dimensions, ScrollView, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {useWallets} from '@app/hooks';

import {CarouselItem} from './carousel-item';
import {Icon, Text} from './ui';
import {WalletCard} from './wallet-card';
import {WalletCreate} from './wallet-create';

import {LIGHT_GRAPHIC_BASE_1, LIGHT_TEXT_BASE_1} from '../variables';

export const Wallets = () => {
  const wallets = useWallets();
  const [visibleRows, setVisibleRows] = useState(wallets.visible);

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
    <View style={page.container}>
      <ScrollView
        pagingEnabled
        horizontal
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={({nativeEvent}) => {
          pan.setValue(
            nativeEvent.contentOffset.x / Dimensions.get('window').width,
          );
        }}
        style={page.scroll}
        contentContainerStyle={page.scrollInner}>
        {visibleRows.map((w, i) => (
          <CarouselItem index={i} pan={pan} key={w.address}>
            <WalletCard address={w.address} />
          </CarouselItem>
        ))}
        <CarouselItem index={visibleRows.length} pan={pan}>
          <WalletCreate />
        </CarouselItem>
      </ScrollView>
      <View style={page.sub}>
        {visibleRows.map((w, i) => (
          <Animated.View
            key={w.address}
            style={[
              page.animateViewList,
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
            page.animateView,
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
      <Text t6 style={page.t6}>
        Transactions
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
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
    backgroundColor: LIGHT_GRAPHIC_BASE_1,
  },
  animateView: {
    width: 12,
    height: 12,
  },
  t6: {
    marginVertical: 12,
    textAlign: 'left',
    paddingHorizontal: 20,
    fontWeight: '600',
    color: LIGHT_TEXT_BASE_1,
  },
});
