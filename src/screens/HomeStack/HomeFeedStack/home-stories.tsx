import React from 'react';

import {toJS} from 'mobx';
import {observer} from 'mobx-react';

import {StoriesView} from '@app/components/stories/story-view';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Stories} from '@app/models/stories';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';

export const HomeStoriesScreen = observer(() => {
  const navigation = useTypedNavigation<HomeFeedStackParamList>();
  const {params} = useTypedRoute<
    HomeFeedStackParamList,
    HomeFeedStackRoutes.HomeStories
  >();

  const convertedStory = Stories.stories.map(story => {
    const stories = story.attachments.map(item => {
      return {
        id: item.id,
        sourceUrl: item.attachment.source,
        mediaType: item.attachment.type,
        duration: item.attachment.duration * 1000,
        markup: toJS(item.markup),
        story_id: item.story_id,
      };
    });

    return {
      id: story.id,
      stories,
    };
  });

  return (
    <StoriesView
      initialID={params.id}
      onHide={() => navigation.goBack()}
      stories={convertedStory}
      onStoryStart={id => {
        if (id) {
          Stories.markAsSeen(id);
        }
      }}
    />
  );
});
