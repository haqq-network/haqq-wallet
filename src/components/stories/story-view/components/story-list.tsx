import React, {FC, memo, useMemo} from 'react';

import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import {StoryAnimation} from './story-animation';
import {StoryContent} from './story-content';
import {StoryHeader} from './story-header';
import {StoryImage} from './story-image';
import {StoryOverlay} from './story-overlay';
import {StoryProgress} from './story-progress';

import {HEIGHT} from '../core/constants';
import {StoryListProps} from '../core/dto/componentsDTO';

const StoryList: FC<StoryListProps> = memo(
  ({
    id,
    stories,
    index,
    x,
    activeUser,
    activeStory,
    progress,
    seenStories,
    paused,
    onLoad,
    videoProps,
    progressColor,
    progressActiveColor,
    mediaContainerStyle,
    imageStyles,
    ...props
  }) => {
    const imageHeight = useSharedValue(HEIGHT);
    const isActive = useDerivedValue(() => activeUser.value === id);

    const activeStoryIndex = useDerivedValue(() =>
      stories.findIndex(item => item.id === activeStory.value),
    );

    const animatedStyles = useAnimatedStyle(() => ({
      height: imageHeight.value,
    }));

    const onImageLayout = (height: number) => {
      imageHeight.value = height;
    };

    const lastSeenIndex = useMemo(
      () => stories.findIndex(item => item.id === seenStories.value[id]),
      [stories],
    );

    return (
      <StoryAnimation x={x} index={index}>
        <Animated.View style={animatedStyles}>
          <StoryImage
            stories={stories}
            activeStory={activeStory}
            defaultImage={
              stories[lastSeenIndex + 1]?.sourceUrl ?? stories[0]?.sourceUrl
            }
            isDefaultVideo={
              (stories[lastSeenIndex + 1]?.mediaType ??
                stories[0]?.mediaType) === 'video'
            }
            onImageLayout={onImageLayout}
            onLoad={onLoad}
            paused={paused}
            isActive={isActive}
            videoProps={videoProps}
            mediaContainerStyle={mediaContainerStyle}
            imageStyles={imageStyles}
          />
          <StoryProgress
            active={isActive}
            activeStory={activeStoryIndex}
            progress={progress}
            length={stories.length}
            progressColor={progressColor}
            progressActiveColor={progressActiveColor}
          />
          <StoryHeader {...props} storyID={activeStory.value!} />
          <StoryContent
            stories={stories}
            active={isActive}
            activeStory={activeStory}
          />
          <StoryOverlay
            onClose={props.onClose}
            stories={stories}
            activeStory={activeStory}
          />
        </Animated.View>
      </StoryAnimation>
    );
  },
);

export {StoryList};
