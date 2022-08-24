import React from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { Container } from '../components/container';

type HomeSettingsScreenProp = CompositeScreenProps<any, any>;

export const HomeMarketScreen = ({ navigation }: HomeSettingsScreenProp) => {
  return <Container />;
};
