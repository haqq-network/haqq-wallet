import {useWallets} from '../contexts/wallets';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {H2} from './ui';
import {Animated, Dimensions, PanResponder, View} from 'react-native';
import {MAGIC_CARD_HEIGHT} from '../variables';
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
        Animated.spring(pan, {
          toValue: delta,
          useNativeDriver: false,
        }).start(() => {
          progress.setValue(progress._value + delta);
          pan.setValue(0);
        });
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
            pan={Animated.add(progress, pan)}
            key={w.address}>
            <WalletCard wallet={w} />
          </CarouselItem>
        ))}
        <CarouselItem
          height={cardWidth * MAGIC_CARD_HEIGHT}
          index={wallets.length}
          pan={Animated.add(progress, pan)}>
          <WalletCreate />
        </CarouselItem>
      </Animated.View>
      <H2
        style={{marginVertical: 12, textAlign: 'left', paddingHorizontal: 20}}>
        Transactions
      </H2>
    </View>
  );
};
