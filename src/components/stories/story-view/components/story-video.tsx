/* eslint-disable react-hooks/rules-of-hooks */
import React, {FC, memo, useRef, useState} from 'react';

import {runOnJS, useAnimatedReaction} from 'react-native-reanimated';
import Video from 'react-native-video';

import {HEIGHT, WIDTH} from '../core/constants';
import {StoryVideoProps} from '../core/dto/componentsDTO';

const StoryVideo: FC<StoryVideoProps> = memo(
  ({uri, paused, isActive, onLoad, onLayout, ...props}) => {
    try {
      const ref = useRef<any>(null);

      const [pausedValue, setPausedValue] = useState(!paused.value);

      const start = () => ref.current?.seek(0);

      useAnimatedReaction(
        () => paused.value,
        (res, prev) => res !== prev && runOnJS(setPausedValue)(!res),
        [paused.value],
      );

      useAnimatedReaction(
        () => isActive.value,
        res => res && runOnJS(start)(),
        [isActive.value],
      );

      return (
        <Video
          ref={ref}
          style={{width: WIDTH, height: HEIGHT}}
          {...props}
          source={{uri}}
          paused={!pausedValue}
          controls={false}
          repeat={false}
          onLoad={({duration}: {duration: number}) => {
            onLoad(Math.ceil(duration * 1000));
          }}
          onLayout={e => onLayout(e.nativeEvent.layout.height)}
          resizeMode="cover"
          automaticallyWaitsToMinimizeStalling
          ignoreSilentSwitch="ignore"
        />
      );
    } catch (error) {
      return null;
    }
  },
);

export {StoryVideo};
