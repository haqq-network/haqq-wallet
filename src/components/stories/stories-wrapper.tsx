import React, {useMemo} from 'react';

import {observer} from 'mobx-react';
import {ScrollView} from 'react-native';

import {StoriesLoaderItem} from '@app/components/stories/stories-loader-item';
import {StoriesPreviewItem} from '@app/components/stories/stories-preview-item';
import {createTheme} from '@app/helpers';
import {Stories} from '@app/models/stories';

export const StoriesWrapper = observer(() => {
  const content = useMemo(() => {
    if (Stories.isLoading) {
      return [...new Array(7)].map((_, index) => {
        return <StoriesLoaderItem key={index} />;
      });
    }
    return Stories.stories.map(item => {
      return <StoriesPreviewItem item={item} key={item.id} />;
    });
  }, [Stories.isLoading]);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!Stories.isLoading}>
      {content}
    </ScrollView>
  );
});

const styles = createTheme({
  container: {
    paddingLeft: 8,
    marginBottom: 6,
  },
});
