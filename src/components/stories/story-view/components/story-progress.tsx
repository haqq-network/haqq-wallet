import React, {FC, memo} from 'react';

import {View} from 'react-native';

import {createTheme} from '@app/theme';

import {StoryProgressItem} from './story-progress-item';

import {WIDTH} from '../core/constants';
import {StoryProgressProps} from '../core/dto/componentsDTO';

const StoryProgress: FC<StoryProgressProps> = memo(
  ({
    progress,
    active,
    activeStory,
    length,
    progressActiveColor,
    progressColor,
  }) => {
    const width =
      (WIDTH -
        styles.container.left * 2 -
        (length - 1) * styles.container.gap) /
      length;

    return (
      <View style={[styles.container, {width: WIDTH}]}>
        {[...Array(length).keys()].map(val => (
          <StoryProgressItem
            active={active}
            activeStory={activeStory}
            progress={progress}
            index={val}
            width={width}
            key={val}
            progressActiveColor={progressActiveColor}
            progressColor={progressColor}
          />
        ))}
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    height: 4,
    flexDirection: 'row',
    gap: 4,
  },
});

export {StoryProgress};
