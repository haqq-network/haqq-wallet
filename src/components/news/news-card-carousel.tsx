import React, {useCallback} from 'react';

import {StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {BaseNewsItem} from '@app/types';

import {NewsCard} from './news-card';

import {CarouselItem} from '../wallets/carousel-item';

export type NewsCardCarouselProps = {
  data: BaseNewsItem[] | Realm.Results<BaseNewsItem>;
  onPress: (id: string) => void;
};

export function NewsCardCarousel({data, onPress}: NewsCardCarouselProps) {
  const pan = useSharedValue(0);
  const dimensions = useWindowDimensions();
  const scrollHandler = useAnimatedScrollHandler(
    event => {
      pan.value = event.contentOffset.x / dimensions.width;
    },
    [dimensions],
  );

  const renderItem = useCallback(
    (item: BaseNewsItem, i: number) => (
      <CarouselItem index={i} pan={pan} key={item.id}>
        <NewsCard item={item} onPress={onPress} />
      </CarouselItem>
    ),
    [onPress, pan],
  );

  return (
    <Animated.ScrollView
      pagingEnabled
      horizontal
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      style={styles.scroll}>
      {data.map(renderItem)}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {overflow: 'hidden'},
});
