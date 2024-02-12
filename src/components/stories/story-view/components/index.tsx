import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {Image} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import {StoryContainer} from './story-container';

import {
  ANIMATION_DURATION,
  BACKGROUND_COLOR,
  CLOSE_COLOR,
  STORY_AVATAR_SIZE,
} from '../core/constants';
import {StoryContainerPublicMethods} from '../core/dto/componentsDTO';
import {ProgressStorageProps} from '../core/dto/helpersDTO';
import {
  StoriesViewProps,
  StoriesViewPublicMethods,
} from '../core/dto/storiesViewDTO';
import {
  clearProgressStorage,
  getProgressStorage,
  setProgressStorage,
} from '../core/helpers/storage';

const StoriesView = forwardRef<StoriesViewPublicMethods, StoriesViewProps>(
  (
    {
      stories,
      saveProgress = false,
      storyAvatarSize = STORY_AVATAR_SIZE,
      animationDuration = ANIMATION_DURATION,
      backgroundColor = BACKGROUND_COLOR,
      videoAnimationMaxDuration,
      videoProps,
      closeIconColor = CLOSE_COLOR,
      initialID,
      ...props
    },
    ref,
  ) => {
    const [data, setData] = useState(stories);

    const seenStories = useSharedValue<ProgressStorageProps>({});
    const loadedStories = useSharedValue(false);
    const loadingStory = useSharedValue<string | undefined>(undefined);

    const modalRef = useRef<StoryContainerPublicMethods>(null);

    useEffect(() => {
      onPress(initialID);
    }, [initialID]);

    const onPress = (id: string) => {
      loadingStory.value = id;
      modalRef.current?.show(id);
    };

    const onLoad = () => {
      loadingStory.value = undefined;
    };

    const onStoriesChange = async () => {
      seenStories.value = await (saveProgress ? getProgressStorage() : {});

      const promises = stories.map(story => {
        const seenStoryIndex = story.stories.findIndex(
          item => item.id === seenStories.value[story.id],
        );
        const seenStory = story.stories[seenStoryIndex + 1] || story.stories[0];

        if (!seenStory) {
          return true;
        }

        return seenStory.mediaType !== 'video'
          ? Image.prefetch(seenStory.sourceUrl)
          : true;
      });

      await Promise.all(promises);

      loadedStories.value = true;

      if (loadingStory.value) {
        onPress(loadingStory.value);
      }
    };

    const onSeenStoriesChange = async (user: string, value: string) => {
      if (!saveProgress) {
        return;
      }

      if (seenStories.value[user]) {
        const userData = data.find(story => story.id === user);
        const oldIndex = userData?.stories.findIndex(
          story => story.id === seenStories.value[user],
        );
        const newIndex = userData?.stories.findIndex(
          story => story.id === value,
        );

        if (oldIndex! > newIndex!) {
          return;
        }
      }

      seenStories.value = await setProgressStorage(user, value);
    };

    useImperativeHandle(
      ref,
      () => ({
        spliceStories: (newStories, index) => {
          if (index === undefined) {
            setData([...data, ...newStories]);
          } else {
            const newData = [...data];
            newData.splice(index, 0, ...newStories);
            setData(newData);
          }
        },
        spliceUserStories: (newStories, user, index) => {
          const userData = data.find(story => story.id === user);

          if (!userData) {
            return;
          }

          const newData =
            index === undefined
              ? [...userData.stories, ...newStories]
              : [...userData.stories];

          if (index !== undefined) {
            newData.splice(index, 0, ...newStories);
          }

          setData(
            data.map(value =>
              value.id === user
                ? {
                    ...value,
                    stories: newData,
                  }
                : value,
            ),
          );
        },
        setStories: newStories => {
          setData(newStories);
        },
        clearProgressStorage,
        hide: () => modalRef.current?.hide(),
        show: id => {
          if (id) {
            onPress(id);
          } else if (data[0]?.id) {
            onPress(data[0]?.id);
          }
        },
        pause: () => modalRef.current?.pause()!,
        resume: () => modalRef.current?.resume()!,
        getCurrentStory: () => modalRef.current?.getCurrentStory()!,
      }),
      [data],
    );

    useEffect(() => {
      onStoriesChange();
    }, [data]);

    useEffect(() => {
      setData(stories);
    }, [stories]);

    return (
      <StoryContainer
        ref={modalRef}
        stories={data}
        seenStories={seenStories}
        duration={animationDuration}
        storyAvatarSize={storyAvatarSize}
        onLoad={onLoad}
        onSeenStoriesChange={onSeenStoriesChange}
        backgroundColor={backgroundColor}
        videoDuration={videoAnimationMaxDuration}
        videoProps={videoProps}
        closeIconColor={closeIconColor}
        initialID={initialID}
        {...props}
      />
    );
  },
);

const StoriesViewMemo = memo(StoriesView);
export {StoriesViewMemo as StoriesView};
