import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {H3} from '../components/ui';

type HomeSettingsScreenProp = CompositeScreenProps<any, any>;

export const HomeMarketScreen = ({navigation}: HomeSettingsScreenProp) => {
  return (
    <Container>
      <H3>Market Screen</H3>
    </Container>
  );
};
