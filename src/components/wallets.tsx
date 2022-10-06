import {useWallets} from '../contexts/wallets';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Text, PlusIcon} from './ui';
import {StyleSheet, Animated, Dimensions, ScrollView, View} from 'react-native';
import {GRAPHIC_BASE_1, MAGIC_CARD_HEIGHT, TEXT_BASE_1} from '../variables';
import {CarouselItem} from './carousel-item';
import {WalletCard} from './wallet-card';
import {WalletCreate} from './wallet-create';

const cardWidth = Dimensions.get('window').width - 40;

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
        style={[
          page.scroll,
          {
            height: cardWidth * MAGIC_CARD_HEIGHT + 48,
          },
        ]}>
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
          <PlusIcon color={GRAPHIC_BASE_1} width={12} height={12} />
        </Animated.View>
      </View>
      <Text t6 style={page.t6}>
        Transactions
      </Text>
    </View>
  );
};

const page = StyleSheet.create({
  container: {position: 'relative'},
  scroll: {overflow: 'hidden'},
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
    backgroundColor: GRAPHIC_BASE_1,
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
    color: TEXT_BASE_1,
  },
});
