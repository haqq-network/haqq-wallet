import {useWallets} from '../contexts/wallets';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {H2, PlusIcon} from './ui';
import {Animated, Dimensions, PanResponder, View} from 'react-native';
import {GRAPHIC_BASE_1, MAGIC_CARD_HEIGHT} from '../variables';
import {CarouselItem} from './carousel-item';
import {WalletCard} from './wallet-card';
import {WalletCreate} from './wallet-create';

const cardWidth = Dimensions.get('window').width - 40;
const cardHeight = cardWidth * MAGIC_CARD_HEIGHT;

export const Wallets = () => {
  const wallet = useWallets();
  const [wallets, setWallets] = useState(wallet.getWallets());
  const progress = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const current = Animated.add(progress, pan);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const dist =
          Math.max(Math.min(1, gestureState.dy / cardHeight), -1) * -1;

        if (
          progress._value + dist > 0 &&
          progress._value + dist < wallet.getSize()
        ) {
          pan.setValue(dist);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        const dist =
          Math.max(Math.min(1, gestureState.dy / cardHeight), -1) * -1;
        const delta = Math.round(dist);
        if (
          progress._value + dist > 0 &&
          progress._value + dist < wallet.getSize()
        ) {
          Animated.spring(pan, {
            toValue: delta,
            useNativeDriver: false,
          }).start(() => {
            progress.setValue(progress._value + delta);
            pan.setValue(0);
          });
        }
      },
    }),
  ).current;

  const updateWallets = useCallback(() => {
    setWallets(wallet.getWallets());
  }, [wallet]);

  useEffect(() => {
    wallet.on('wallets', updateWallets);

    return () => {
      wallet.off('wallets', updateWallets);
    };
  }, [updateWallets, wallet]);

  if (!wallets.length) {
    return null;
  }

  return (
    <View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          height: cardWidth * MAGIC_CARD_HEIGHT + 48,
          overflow: 'hidden',
          position: 'relative',
        }}>
        {wallets.map((w, i) => (
          <CarouselItem
            height={cardWidth * MAGIC_CARD_HEIGHT}
            index={i}
            pan={current}
            key={w.address}>
            <WalletCard wallet={w} />
          </CarouselItem>
        ))}
        <CarouselItem
          height={cardWidth * MAGIC_CARD_HEIGHT}
          index={wallets.length}
          pan={current}>
          <WalletCreate />
        </CarouselItem>
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {wallets.map((w, i) => (
            <Animated.View
              key={w.address}
              style={{
                width: 6,
                height: 6,
                backgroundColor: GRAPHIC_BASE_1,
                borderRadius: 3,
                margin: 3,
                opacity: current.interpolate({
                  inputRange: [i - 1, i, i + 1],
                  outputRange: [0.5, 1, 0.5],
                  extrapolate: 'clamp',
                }),
              }}
            />
          ))}
          <Animated.View
            style={{
              width: 6,
              height: 6,
              margin: 3,
              opacity: current.interpolate({
                inputRange: [wallet.getSize() - 1, wallet.getSize()],
                outputRange: [0.5, 1],
                extrapolate: 'clamp',
              }),
            }}>
            <PlusIcon color={GRAPHIC_BASE_1} />
          </Animated.View>
        </View>
      </Animated.View>
      <H2
        style={{marginVertical: 12, textAlign: 'left', paddingHorizontal: 20}}>
        Transactions
      </H2>
    </View>
  );
};
