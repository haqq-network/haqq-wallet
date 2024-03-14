import React, {FC, memo} from 'react';

import {ActivityIndicator} from 'react-native';

import {Color, getColor} from '@app/theme';

import {StoryLoaderProps} from '../core/dto/componentsDTO';

const StoryLoader: FC<StoryLoaderProps> = memo(() => {
  return (
    <ActivityIndicator size={'large'} color={getColor(Color.graphicBase3)} />
  );
});

export {StoryLoader};
