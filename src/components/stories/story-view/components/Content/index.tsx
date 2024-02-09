import React, {FC, memo, useMemo, useState} from 'react';

import {StyleSheet, View} from 'react-native';
import {runOnJS, useAnimatedReaction} from 'react-native-reanimated';

import {StoryContentProps} from '../../core/dto/componentsDTO';

const StoryContent: FC<StoryContentProps> = memo(
  ({stories, active, activeStory}) => {
    const [storyIndex, setStoryIndex] = useState(0);

    const onChange = async () => {
      'worklet';

      const index = stories.findIndex(item => item.id === activeStory.value);
      if (active.value && index >= 0 && index !== storyIndex) {
        runOnJS(setStoryIndex)(index);
      }
    };

    useAnimatedReaction(
      () => activeStory.value,
      (res, prev) => res !== prev && onChange(),
      [activeStory.value],
    );

    const content = useMemo(
      () => stories[storyIndex]?.renderContent?.(),
      [storyIndex],
    );

    return content ? (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {content}
      </View>
    ) : null;
  },
);

export {StoryContent};
