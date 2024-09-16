import React, {memo, useCallback, useMemo} from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';
import BlastedImage from 'react-native-blasted-image';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IStory} from '@app/types';

type Props = {
  item: IStory;
  onPress: (id: IStory['id']) => void;
  seen: IStory['seen'];
};

export const StoriesPreviewItem = memo(({item, onPress, seen}: Props) => {
  const source = {
    uri: item.preview ?? '',
  };
  const borderColor = useMemo(
    () => (seen ? styles.borderSeen : styles.borderUnseen),
    [seen],
  );
  const imageWrapperStyles = useMemo(
    () => StyleSheet.flatten([styles.imageWrapper, borderColor]),
    [borderColor, seen],
  );
  const titleColor = useMemo(
    () => (seen ? Color.textBase1 : Color.textBase2),
    [seen],
  );

  const onStoryPress = useCallback(() => onPress(item.id), [item, onPress]);

  return (
    <TouchableOpacity style={styles.container} onPress={onStoryPress}>
      <View style={imageWrapperStyles}>
        <BlastedImage style={styles.image} source={source} resizeMode="cover" />
      </View>

      <Spacer height={2} />
      <Text
        variant={TextVariant.t17}
        style={styles.title}
        numberOfLines={2}
        color={titleColor}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
});

const styles = createTheme({
  image: {height: 56, width: 56, borderRadius: 8},
  container: {
    minHeight: 94,
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: 74,
  },
  imageWrapper: {
    height: 62,
    width: 62,
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
  },
  borderSeen: {
    borderColor: Color.graphicSecond1,
  },
  borderUnseen: {
    borderColor: Color.graphicGreen1,
  },
  title: {
    width: 62,
  },
});
