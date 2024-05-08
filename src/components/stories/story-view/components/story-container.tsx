import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import _ from 'lodash';
import {GestureResponderEvent, Pressable, StyleSheet} from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';
import {ANIMATION_DURATION} from '@app/variables/common';

import {StoryList} from './story-list';

import {
  ANIMATION_CONFIG,
  HEIGHT,
  LONG_PRESS_DURATION,
  WIDTH,
} from '../core/constants';
import {
  StoryContainerProps,
  StoryContainerPublicMethods,
} from '../core/dto/componentsDTO';

const StoryContainer = forwardRef<
  StoryContainerPublicMethods,
  StoryContainerProps
>(
  (
    {
      stories,
      seenStories,
      duration,
      videoDuration,
      storyAvatarSize,
      textStyle,
      containerStyle,
      videoProps,
      closeIconColor,
      onLoad,
      onShow,
      onHide,
      onSeenStoriesChange,
      onStoryStart,
      onStoryEnd,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(true);

    const x = useSharedValue(0);
    const y = useSharedValue(HEIGHT);
    const animation = useSharedValue(0);
    const currentStory = useSharedValue<string | undefined>(
      stories[0]?.stories[0]?.id,
    );
    const paused = useSharedValue(false);
    const durationValue = useSharedValue(duration);

    const userIndex = useDerivedValue(() => Math.round(x.value / WIDTH));
    const storyIndex = useDerivedValue(
      () =>
        stories[userIndex.value]?.stories.findIndex(
          story => story.id === currentStory.value,
        ),
    );
    const userId = useDerivedValue(() => stories[userIndex.value]?.id);
    const previousUserId = useDerivedValue(
      () => stories[userIndex.value - 1]?.id,
    );
    const nextUserId = useDerivedValue(() => stories[userIndex.value + 1]?.id);
    const previousStory = useDerivedValue(() =>
      storyIndex.value !== undefined
        ? stories[userIndex.value]?.stories[storyIndex.value - 1]?.id
        : undefined,
    );
    const nextStory = useDerivedValue(() =>
      storyIndex.value !== undefined
        ? stories[userIndex.value]?.stories[storyIndex.value + 1]?.id
        : undefined,
    );

    const onClose = () => {
      'worklet';

      y.value = withTiming(HEIGHT, {duration: ANIMATION_DURATION}, () =>
        runOnJS(setVisible)(false),
      );
    };

    const stopAnimation = () => {
      'worklet';

      cancelAnimation(animation);
    };

    const startAnimation = (resume = false, newDuration?: number) => {
      'worklet';

      if (newDuration) {
        durationValue.value = newDuration;
      } else {
        newDuration = durationValue.value;
      }

      if (resume) {
        newDuration -= animation.value * newDuration;
      } else {
        animation.value = 0;

        if (userId.value !== undefined && currentStory.value !== undefined) {
          runOnJS(onSeenStoriesChange)(userId.value, currentStory.value);
        }
      }

      animation.value = withTiming(1, {duration: newDuration});
    };

    const scrollTo = (
      id: string,
      animated = true,
      sameUser = false,
      previousUser?: string,
    ) => {
      'worklet';

      const newUserIndex = stories.findIndex(story => story.id === id);
      const newX = newUserIndex * WIDTH;

      x.value = animated ? withTiming(newX, ANIMATION_CONFIG) : newX;

      if (sameUser) {
        startAnimation(true);

        return;
      }

      if (onStoryEnd) {
        runOnJS(onStoryEnd)(previousUser ?? userId.value, currentStory.value);
      }

      const newStoryIndex = stories[newUserIndex]?.stories.findIndex(
        story => story.id === seenStories.value[id],
      );
      const userStories = stories[newUserIndex]?.stories;
      const newStory =
        newStoryIndex !== undefined
          ? userStories?.[newStoryIndex + 1]?.id ?? userStories?.[0]?.id
          : undefined;
      currentStory.value = newStory;

      if (onStoryStart) {
        runOnJS(onStoryStart)(id, newStory);
      }
    };

    const toNextStory = (value = true) => {
      'worklet';

      if (!value) {
        return;
      }

      if (!nextStory.value) {
        if (nextUserId.value) {
          scrollTo(nextUserId.value);
        } else {
          onClose();
        }
      } else {
        if (onStoryEnd) {
          runOnJS(onStoryEnd)(userId.value, currentStory.value);
        }

        if (onStoryStart) {
          runOnJS(onStoryStart)(userId.value, nextStory.value);
        }

        animation.value = 0;
        currentStory.value = nextStory.value;
      }
    };

    const toPreviousStory = () => {
      'worklet';

      if (!previousStory.value) {
        if (previousUserId.value) {
          scrollTo(previousUserId.value);
        } else {
          return false;
        }
      } else {
        if (onStoryEnd) {
          runOnJS(onStoryEnd)(userId.value, currentStory.value);
        }

        if (onStoryStart) {
          runOnJS(onStoryStart)(userId.value, previousStory.value);
        }

        animation.value = 0;
        currentStory.value = previousStory.value;
      }

      return true;
    };

    const show = (id: string) => {
      setVisible(true);
      scrollTo(id, false);
    };

    const onPressIn = ({nativeEvent: {locationX}}: GestureResponderEvent) => {
      stopAnimation();
      paused.value = true;

      if (locationX < WIDTH / 3) {
        paused.value = false;

        const success = toPreviousStory();

        if (!success) {
          startAnimation(true);
        }
      } else if (locationX > (WIDTH * 2) / 3) {
        paused.value = false;
        EventTracker.instance.trackEvent(MarketingEvents.storySkip);
        toNextStory();
      }
    };

    const onPressOut = () => {
      paused.value = false;
      startAnimation(true);
    };

    const onLongPress = () => startAnimation(true);

    useImperativeHandle(
      ref,
      () => ({
        show,
        hide: onClose,
        pause: () => {
          stopAnimation();
          paused.value = true;
        },
        resume: () => {
          startAnimation(true);
          paused.value = false;
        },
        getCurrentStory: () => ({
          userId: userId.value,
          storyId: currentStory.value,
        }),
      }),
      [userId.value, currentStory.value],
    );

    useEffect(() => {
      if (visible) {
        if (currentStory.value !== undefined) {
          onShow?.(currentStory.value);
        }
        onLoad?.();

        y.value = withTiming(0, {duration: ANIMATION_DURATION});
      } else if (currentStory.value !== undefined) {
        onHide?.(currentStory.value);
      }
    }, [visible]);

    useAnimatedReaction(
      () => animation.value,
      (res, prev) => res !== prev && toNextStory(res === 1),
      [animation.value],
    );

    const fireOpenEvent = useCallback(() => {
      EventTracker.instance.trackEvent(MarketingEvents.storyOpen);
    }, []);
    const debouncedOpenEvent = _.debounce(fireOpenEvent, 1000, {
      leading: true,
      trailing: false,
    });

    const swipeDown = Gesture.Fling()
      .direction(Directions.DOWN)
      .onEnd(() => onClose());

    return (
      <GestureDetector gesture={swipeDown}>
        <Animated.View style={styles.container} testID="storyModal">
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onLongPress={onLongPress}
            delayLongPress={LONG_PRESS_DURATION}
            style={styles.container}>
            <Animated.View style={[styles.absolute, containerStyle]}>
              {stories?.map((story, index) => (
                <StoryList
                  {...story}
                  index={index}
                  x={x}
                  activeUser={userId}
                  activeStory={currentStory}
                  progress={animation}
                  seenStories={seenStories}
                  onClose={onClose}
                  onLoad={value => {
                    const current = story.stories.find(
                      item => item.id === currentStory.value,
                    );
                    onLoad?.();
                    debouncedOpenEvent();
                    startAnimation(
                      undefined,
                      value !== undefined
                        ? videoDuration ?? value
                        : current?.duration ?? duration,
                    );
                  }}
                  avatarSize={storyAvatarSize}
                  textStyle={textStyle}
                  paused={paused}
                  videoProps={videoProps}
                  closeColor={closeIconColor}
                  key={story.id}
                  {...props}
                />
              ))}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    );
  },
);

const styles = createTheme({
  container: {
    flex: 1,
    backgroundColor: Color.bg10,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
  },
  bgAnimation: StyleSheet.absoluteFillObject,
});

const StoryContainerMemo = memo(StoryContainer);
export {StoryContainerMemo as StoryContainer};
