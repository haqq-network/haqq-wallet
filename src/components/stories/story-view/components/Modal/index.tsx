import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import {GestureResponderEvent, Pressable, StyleSheet} from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {GestureHandler} from './gesture';

import {
  ANIMATION_CONFIG,
  HEIGHT,
  LONG_PRESS_DURATION,
  WIDTH,
} from '../../core/constants';
import {
  GestureContext,
  StoryModalProps,
  StoryModalPublicMethods,
} from '../../core/dto/componentsDTO';
import {StoryList} from '../List';

const StoryModal = forwardRef<StoryModalPublicMethods, StoryModalProps>(
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
      modalAnimationDuration = 300,
      onLoad,
      onShow,
      onHide,
      onSeenStoriesChange,
      onSwipeUp,
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

      y.value = withTiming(HEIGHT, {duration: modalAnimationDuration}, () =>
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

    const onGestureEvent = useAnimatedGestureHandler({
      onStart: (e, ctx: GestureContext) => {
        ctx.x = x.value;
        ctx.userId = userId.value;
      },
      onActive: (e, ctx) => {
        if (
          ctx.x === x.value &&
          (ctx.vertical || Math.abs(e.velocityX) < Math.abs(e.velocityY))
        ) {
          ctx.vertical = true;
          y.value = e.translationY / 2;
        } else {
          ctx.moving = true;
          x.value = Math.max(
            0,
            Math.min(ctx.x + -e.translationX, WIDTH * (stories.length - 1)),
          );
        }
      },
      onFinish: (e, ctx) => {
        if (ctx.vertical) {
          if (e.translationY > 100) {
            onClose();
          } else {
            if (e.translationY < -100 && onSwipeUp) {
              runOnJS(onSwipeUp)(
                stories[userIndex.value]?.id,
                stories[userIndex.value]?.stories[storyIndex.value ?? 0]?.id,
              );
            }

            y.value = withTiming(0);
            startAnimation(true);
          }
        } else if (ctx.moving) {
          const diff = x.value - ctx.x;
          let newX;

          if (Math.abs(diff) < WIDTH / 4) {
            newX = ctx.x;
          } else {
            newX =
              diff > 0
                ? Math.ceil(x.value / WIDTH) * WIDTH
                : Math.floor(x.value / WIDTH) * WIDTH;
          }

          const newUserId = stories[Math.round(newX / WIDTH)]?.id;
          if (newUserId !== undefined) {
            scrollTo(newUserId, true, newUserId === ctx.userId, ctx.userId);
          }
        }

        ctx.moving = false;
        ctx.vertical = false;
        ctx.userId = undefined;
      },
    });

    const onPressIn = () => {
      stopAnimation();
      paused.value = true;
    };

    const onLongPress = () => startAnimation(true);

    const onPress = ({nativeEvent: {locationX}}: GestureResponderEvent) => {
      if (locationX < WIDTH / 2) {
        const success = toPreviousStory();

        if (!success) {
          startAnimation(true);
        }
      } else {
        toNextStory();
      }

      paused.value = false;
    };

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

        y.value = withTiming(0, {duration: modalAnimationDuration});
      } else if (currentStory.value !== undefined) {
        onHide?.(currentStory.value);
      }
    }, [visible]);

    useAnimatedReaction(
      () => animation.value,
      (res, prev) => res !== prev && toNextStory(res === 1),
      [animation.value],
    );

    return (
      <GestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.container} testID="storyModal">
          <Pressable
            onPressIn={onPressIn}
            onPress={onPress}
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
                    onLoad?.();
                    startAnimation(
                      undefined,
                      value !== undefined ? videoDuration ?? value : duration,
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
      </GestureHandler>
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

const StoryModalMemo = memo(StoryModal);
export {StoryModalMemo as StoryModal};
