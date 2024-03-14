import React from 'react';

import {observer} from 'mobx-react';
import {ScrollView} from 'react-native';

import {StoriesLoaderItem} from '@app/components/stories/stories-loader-item';
import {StoriesPreviewItem} from '@app/components/stories/stories-preview-item';
import {Stories} from '@app/models/stories';
import {createTheme} from '@app/theme';
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
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!Stories.isLoading}>
      {content()}
    </ScrollView>
  );
});

const styles = createTheme({
  container: {
    paddingLeft: 8,
    marginBottom: 6,
  },
});
