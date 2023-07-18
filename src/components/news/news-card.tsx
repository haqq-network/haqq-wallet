import React, {useMemo} from 'react';

import {format} from 'date-fns';
import {ImageBackground, TouchableWithoutFeedback, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {BaseNewsItem} from '@app/types';
import {addOpacityToColor} from '@app/utils';
import {MAGIC_NEWS_CARD_HEIGHT, WINDOW_WIDTH} from '@app/variables/common';

import {Text} from '../ui';

export type NewsRowProps = {
  item: BaseNewsItem;
  onPress: (id: string) => void;
};

const MARGIN_HORIZONTAL = 20;
export const NEWS_CARD_WIDTH =
  WINDOW_WIDTH - MARGIN_HORIZONTAL - MARGIN_HORIZONTAL;
export const NEWS_CARD_HEIGHT = NEWS_CARD_WIDTH * MAGIC_NEWS_CARD_HEIGHT;

export const NewsCard = ({item, onPress}: NewsRowProps) => {
  const preview = useMemo(() => {
    if (!item.preview) {
      return require('@assets/images/news_placeholder.png');
    }

    return {uri: item.preview};
  }, [item.preview]);

  return (
    <View
      style={[styles.flexOne, styles.container, item.viewed && styles.viewed]}>
      <ImageBackground
        key={item.id}
        source={preview}
        style={styles.imageSize}
        imageStyle={styles.image}>
        <TouchableWithoutFeedback onPress={() => onPress(item.id)}>
          <View style={styles.flexOne}>
            <LinearGradient
              style={styles.fade}
              colors={[
                getColor(Color.bg10),
                addOpacityToColor(Color.bg10, 0.5),
                getColor(Color.transparent),
              ]}
              locations={[0.02, 0.3, 0.8]}
              start={{x: 0, y: 1}}
              end={{x: 0, y: 0}}
            />

            <View style={[styles.flexOne, styles.textContainer]}>
              <Text numberOfLines={2} t8 color={Color.textBase3}>
                {item.title}
              </Text>
              <Text t17 color={Color.textBase2}>
                {format(item.createdAt, 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </View>
  );
};

const styles = createTheme({
  container: {
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    borderRadius: 12,
  },
  flexOne: {
    flex: 1,
  },
  fade: {
    flex: 2,
  },
  viewed: {
    opacity: 0.5,
  },
  imageSize: {
    width: NEWS_CARD_WIDTH,
    height: NEWS_CARD_HEIGHT,
  },
  image: {
    borderRadius: 12,
  },
  textContainer: {
    backgroundColor: Color.bg10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
  },
});
