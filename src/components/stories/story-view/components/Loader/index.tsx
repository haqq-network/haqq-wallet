import React, {FC, memo} from 'react';

import {ActivityIndicator} from 'react-native';

import {Color, getColor} from '@app/colors';

import {StoryLoaderProps} from '../../core/dto/componentsDTO';

const Loader: FC<StoryLoaderProps> = memo(() => {
  return (
    <ActivityIndicator size={'large'} color={getColor(Color.graphicBase3)} />
  );
});

export {Loader};
