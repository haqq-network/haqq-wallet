import React, {useState} from 'react';
import {Button, Container, Paragraph} from '../components/ui';
import {Dimensions, Image} from 'react-native';
import {
  CARD_CIRCLE_TOTAL,
  CARD_DEFAULT_STYLE,
  CARD_RHOMBUS_TOTAL,
  GRAPHIC_RED_2,
} from '../variables';
import {PATTERNS_SOURCE} from '@env';
import {WalletCardPattern} from '../types';

const width = Dimensions.get('window').width - 60;

export const SettingsTestScreen = () => {
  const [pattern, setPattern] = useState(CARD_DEFAULT_STYLE);

  return (
    <Container>
      <Button
        title="Toggle"
        onPress={() => {
          setPattern((p: string) => {
            if (p.startsWith(WalletCardPattern.circle)) {
              return `${WalletCardPattern.rhombus}-${Math.floor(
                Math.random() * CARD_RHOMBUS_TOTAL,
              )}`;
            }
            return `${WalletCardPattern.circle}-${Math.floor(
              Math.random() * CARD_CIRCLE_TOTAL,
            )}`;
          });
        }}
      />
      <Paragraph>{pattern}</Paragraph>
      <Image
        style={{
          width: width,
          height: width * 0.632835821,
          tintColor: GRAPHIC_RED_2,
        }}
        source={{uri: `${PATTERNS_SOURCE}${pattern}@3x.png`}}
      />
    </Container>
  );
};
