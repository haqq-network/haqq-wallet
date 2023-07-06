import React, {useMemo} from 'react';

import {format} from 'date-fns';
import {Image, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {BaseNewsItem} from '@app/types';

export type NewsRowProps = {
  item: BaseNewsItem;
  onPress: (id: string) => void;
};
export const NewsRow = ({item, onPress}: NewsRowProps) => {
  const preview = useMemo(() => {
    if (!item.preview) {
      return require('@assets/images/news_placeholder.png');
    }

    return {uri: item.preview};
  }, [item.preview]);

  const containerStyle = useMemo(
    () => [styles.container, item.viewed && styles.viewed].filter(Boolean),
    [item.viewed],
  );

  return (
    <TouchableWithoutFeedback onPress={() => onPress(item.id)}>
      <View style={containerStyle}>
        <View style={styles.imageWrapper}>
          <Image source={preview} style={styles.image} />
        </View>
        <View style={styles.description}>
          <Text t10 numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
          <Spacer height={2} />
          <Text
            t14
            numberOfLines={2}
            color={Color.textBase2}
            ellipsizeMode="tail">
            {item.description}
          </Text>
          <Spacer />
          <Text t17 color={Color.textBase2}>
            {format(item.createdAt, 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  viewed: {
    opacity: 0.5,
  },
  container: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
  },
  imageWrapper: {
    marginHorizontal: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    overflow: 'hidden',
  },
  description: {
    marginHorizontal: 6,
    flex: 1,
  },
});
