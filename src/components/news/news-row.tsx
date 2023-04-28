import React from 'react';

import {format} from 'date-fns';
import {Image, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {News} from '@app/models/news';

export type NewsRowProps = {
  item: News;
  onPress: (id: string) => void;
};
export const NewsRow = ({item, onPress}: NewsRowProps) => {
  return (
    <TouchableWithoutFeedback onPress={() => onPress(item.id)}>
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image source={{uri: item.preview}} style={styles.image} />
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
          <Spacer height={2} />
          <Text t17 color={Color.textBase2}>
            {format(item.publishedAt, 'ccc dd, yyyy')}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
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
