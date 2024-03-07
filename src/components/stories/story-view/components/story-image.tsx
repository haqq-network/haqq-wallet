import React, {FC, memo, useState} from 'react';

import {Image, View} from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import {StoryLoader} from '@app/components/stories/story-view/components/loader';
import {createTheme} from '@app/helpers';
import {Color} from '@app/theme';

import {StoryVideo} from './story-video';

import {HEIGHT, LOADER_COLORS, WIDTH} from '../core/constants';
import {StoryImageProps} from '../core/dto/componentsDTO';

const StoryImage: FC<StoryImageProps> = memo(
  ({
    stories,
    activeStory,
    defaultImage,
    isDefaultVideo,
    paused,
    videoProps,
    isActive,
    mediaContainerStyle,
    imageStyles,
    onImageLayout,
    onLoad,
  }) => {
    const [data, setData] = useState<{
      uri: string | undefined;
      isVideo?: boolean;
    }>({uri: defaultImage, isVideo: isDefaultVideo});

    const loading = useSharedValue(true);
    const color = useSharedValue(LOADER_COLORS);
    const videoDuration = useSharedValue<number | undefined>(undefined);
    const isPaused = useDerivedValue(() => paused.value || !isActive.value);

    const onImageChange = async () => {
      if (!activeStory.value) {
        return;
      }

      const story = stories.find(item => item.id === activeStory.value);

      if (!story) {
        return;
      }

      if (data.uri === story.sourceUrl) {
        if (!loading.value) {
          onLoad(videoDuration.value);
        }
      } else {
        loading.value = true;
        setData({uri: story.sourceUrl, isVideo: story.mediaType === 'video'});
      }

      const nextStory = stories[stories.indexOf(story) + 1];

      if (nextStory && nextStory.mediaType !== 'video') {
        Image.prefetch(nextStory.sourceUrl);
      }
    };

    useAnimatedReaction(
      () => isActive.value,
      (res, prev) => res !== prev && res && runOnJS(onImageChange)(),
      [isActive.value],
    );

    useAnimatedReaction(
      () => activeStory.value,
      (res, prev) => res !== prev && runOnJS(onImageChange)(),
      [activeStory.value],
    );

    const onContentLoad = (duration?: number) => {
      if (data.isVideo) {
        videoDuration.value = duration;
      }

      loading.value = false;

      if (isActive.value) {
        onLoad(duration);
      }
    };

    return (
      <>
        <View style={styles.container}>
          <StoryLoader loading={loading} color={color} size={33} />
        </View>
        <View style={[styles.image, mediaContainerStyle]}>
          {data.uri &&
            (data.isVideo ? (
              <StoryVideo
                onLoad={onContentLoad}
                onLayout={onImageLayout}
                uri={data.uri}
                paused={isPaused}
                isActive={isActive}
                {...videoProps}
              />
            ) : (
              <Image
                source={{uri: data.uri}}
                style={[{width: WIDTH, height: HEIGHT}, imageStyles]}
                resizeMode="cover"
                testID="storyImageComponent"
                onLayout={e =>
                  onImageLayout(Math.min(HEIGHT, e.nativeEvent.layout.height))
                }
                onLoad={() => onContentLoad()}
              />
            ))}
        </View>
      </>
    );
  },
);

const styles = createTheme({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.bg10,
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    backgroundColor: Color.graphicBase3,
  },
});

export {StoryImage};
