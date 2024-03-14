import React, {FC, memo} from 'react';

import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import {Color, createTheme} from '@app/theme';
import {addOpacityToColor} from '@app/utils';

import {StoryProgressItemProps} from '../core/dto/componentsDTO';

const AnimatedView = Animated.createAnimatedComponent(View);

const StoryProgressItem: FC<StoryProgressItemProps> = memo(
  ({progress, active, activeStory, index, width}) => {
    const animatedStyle = useAnimatedStyle(() => {
      if (!active.value || activeStory.value < index) {
        return {width: 0};
      }

      if (activeStory.value > index) {
        return {width};
      }

      return {width: width * progress.value};
    });

    return (
      <View
        style={[
          styles.item,
          {backgroundColor: addOpacityToColor(Color.graphicBase3, 0.3)},
          {width},
        ]}>
        <AnimatedView style={[styles.item, animatedStyle]} />
      </View>
    );
  },
);

const styles = createTheme({
  item: {
    height: 4,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Color.graphicBase3,
  },
});

export {StoryProgressItem};
