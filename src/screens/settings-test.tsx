import React, {useState} from 'react';
import {Button, Container, Paragraph} from '../components/ui';
import {Dimensions, Image} from 'react-native';
import {ImageResolution} from '../types';
import {usePattern} from '../hooks/usePattern';

const width = Dimensions.get('window').width - 60;

export const SettingsTestScreen = () => {
  const [pattern, setPattern] = useState('card-circles-0');

  const preset = usePattern(pattern, ImageResolution.x2);

  return (
    <Container>
      <Button
        title="Toggle"
        onPress={() => {
          setPattern(p =>
            p === 'card-circles-0' ? 'card-rhombus-0' : 'card-circles-0',
          );
        }}
      />
      <Paragraph>{pattern}</Paragraph>
      {preset && (
        <Image
          style={{
            width: width,
            height: width * 0.632835821,
            tintColor: 'tomato',
          }}
          source={preset}
        />
      )}
    </Container>
  );
};
