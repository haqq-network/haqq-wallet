import React from 'react';

import {observer} from 'mobx-react';
import {ScrollView} from 'react-native';

import {StoriesLoaderItem} from '@app/components/stories/stories-loader-item';
import {StoriesPreviewItem} from '@app/components/stories/stories-preview-item';
import {createTheme} from '@app/helpers';
import {Stories} from '@app/models/stories';
import {IStory} from '@app/types';

type Props = {
  onStoryPress: (id: IStory['id']) => void;
};

export const StoriesWrapper = observer(({onStoryPress}: Props) => {
  const content = () => {
    if (!Stories.isHydrated || Stories.isLoading) {
      return [...new Array(7)].map((_, index) => {
        return <StoriesLoaderItem key={index} />;
      });
    }
    return Stories.stories.map(item => {
      return (
        <StoriesPreviewItem
          seen={item.seen}
          item={item}
          key={item.id}
          onPress={onStoryPress}
        />
      );
    });
  };

  return (
    <ScrollView
      bounces={false}
      horizontal
      contentContainerStyle={styles.scrollViewContentContainer}
      style={styles.container}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!Stories.isLoading}>
      {content()}
    </ScrollView>
  );
});

const styles = createTheme({
  container: {
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
});
