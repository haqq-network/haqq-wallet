/* eslint-disable react-hooks/rules-of-hooks */
import React, {FC, memo, useMemo, useRef, useState} from 'react';

import {runOnJS, useAnimatedReaction} from '@override/react-native-reanimated';
import Video from 'react-native-video';

import {HEIGHT, WIDTH} from '../core/constants';
import {StoryVideoProps} from '../core/dto/componentsDTO';

const StoryVideo: FC<StoryVideoProps> = memo(
  ({uri, paused, isActive, onLoad, onLayout, ...props}) => {
    try {
      const ref = useRef<any>(null);
      const source = useMemo(() => ({uri}), [uri]);
      const [pausedValue, setPausedValue] = useState<boolean | null>(null);

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

      if (pausedValue === null) {
        return null;
      }

      return (
        <Video
          ref={ref}
          style={{width: WIDTH, height: HEIGHT}}
          {...props}
          source={source}
          paused={!pausedValue}
          controls={false}
          repeat={false}
          onLoad={({duration}: {duration: number}) => {
            onLoad(Math.ceil(duration * 1000));
          }}
          onLayout={e => onLayout(e.nativeEvent.layout.height)}
          resizeMode="cover"
          automaticallyWaitsToMinimizeStalling={false}
          ignoreSilentSwitch="ignore"
          allowsExternalPlayback={false}
        />
      );
    } catch (error) {
      return null;
    }
  },
);

export {StoryVideo};
