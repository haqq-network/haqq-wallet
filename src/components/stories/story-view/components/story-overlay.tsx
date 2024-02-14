import React, {ReactNode, memo, useCallback} from 'react';

import {View} from 'react-native';
import {SharedValue} from 'react-native-reanimated';

import {StoryItemProps} from '@app/components/stories/story-view/core/dto/storiesViewDTO';
import {Button, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {ArrayElement} from '@app/types';
import {generateUUID} from '@app/utils';

type MarkupItem = ArrayElement<StoryItemProps['markup']>;

type IOverlayItemMap = {
  [key in MarkupItem['row']['type']]: (params: any) => ReactNode;
};

const OverlayMap: IOverlayItemMap = {
  button: props => <Button {...props} />,
  text: props => <Text {...props} />,
  spacer: props => <Spacer {...props} />,
};

type Props = {
  stories: StoryItemProps[];
  activeStory: SharedValue<string | undefined>;
};

const StoryOverlay = memo(({stories, activeStory}: Props) => {
  const markup = stories.find(item => item.id === activeStory?.value)?.markup;

  const renderItem = useCallback((item: MarkupItem): ReactNode => {
    const Element = OverlayMap[item.row.type];
    const props = item.row;
    if (!Element) {
      return null;
    }
    return <Element key={generateUUID()} {...props} />;
  }, []);

  if (!markup) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.flex}>{markup.map(renderItem)}</View>
    </View>
  );
});

const styles = createTheme({
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    bottom: 26,
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
});

export {StoryOverlay};
