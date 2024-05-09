import React, {ReactNode, memo, useCallback} from 'react';

import {View} from 'react-native';
import {SharedValue} from 'react-native-reanimated';

import {StoryItemProps} from '@app/components/stories/story-view/core/dto/storiesViewDTO';
import {Button, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {openURL} from '@app/helpers/url';
import {EventTracker} from '@app/services/event-tracker';
import {ArrayElement, MarketingEvents} from '@app/types';
import {generateUUID, sleep} from '@app/utils';
import {ANIMATION_DURATION} from '@app/variables/common';

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
  onClose: () => void;
  analyticID: string;
};

const StoryOverlay = memo(
  ({stories, activeStory, onClose, analyticID}: Props) => {
    const markup = stories.find(item => item.id === activeStory?.value)?.markup;

    const renderItem = useCallback(
      (item: MarkupItem): ReactNode => {
        const Element = OverlayMap[item.row.type];
        let props = item.row;
        if (!Element) {
          return null;
        }
        if (item.row.type === 'button') {
          props = {
            ...props,
            onPress: async () => {
              EventTracker.instance.trackEvent(MarketingEvents.storyAction, {
                id: analyticID,
              });
              onClose();
              await sleep(ANIMATION_DURATION * 3);
              if (item.row.target) {
                openURL(item.row.target);
              }
            },
          };
        }
        return <Element key={generateUUID()} {...props} />;
      },
      [analyticID],
    );

    if (!markup) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.flex}>{markup.map(renderItem)}</View>
      </View>
    );
  },
);

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
