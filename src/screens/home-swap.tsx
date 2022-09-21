import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/ui';

type HomeSettingsScreenProp = CompositeScreenProps<any, any>;

export const HomeSwapScreen = ({navigation}: HomeSettingsScreenProp) => {
  return <Container />;
};
