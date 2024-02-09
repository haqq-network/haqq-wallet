import React, {memo, useMemo} from 'react';

import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IStory} from '@app/types';

type Props = {
  item: IStory;
  onPress: (id: IStory['id']) => void;
  seen: IStory['seen'];
};

export const StoriesPreviewItem = memo(({item, onPress, seen}: Props) => {
  const isSeen = !!seen;
  const source = {uri: item.preview};
  const borderColor = useMemo(
    () => (isSeen ? styles.borderSeen : styles.borderUnseen),
    [isSeen],
  );
  const imageWrapperStyles = useMemo(
    () => StyleSheet.flatten([styles.imageWrapper, borderColor]),
    [borderColor, isSeen],
  );
  const titleColor = useMemo(
    () => (isSeen ? Color.textBase1 : Color.textBase2),
    [isSeen],
  );

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item.id)}>
      <View style={imageWrapperStyles}>
        <Image
          source={source}
          height={56}
          width={56}
          borderRadius={8}
          resizeMode="cover"
        />
      </View>

      <Spacer height={2} />
      <Text
        t17
        children={item.title}
        style={styles.title}
        numberOfLines={2}
        color={titleColor}
      />
    </TouchableOpacity>
  );
});

const styles = createTheme({
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
