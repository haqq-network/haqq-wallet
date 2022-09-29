import React, {useCallback, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Dimensions, StyleSheet} from 'react-native';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  Container,
  Paragraph,
  SegmentedControl,
  Spacer,
} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {WalletCardStyle} from '../types';
import {Wallet} from '../models/wallet';
import {TEXT_BASE_1} from '../variables';
import {generateFlatColors, generateGradientColors, HSBToHEX} from '../utils';

type SettingsAccountStyleScreenProps = CompositeScreenProps<any, any>;

const variants = [
  {value: WalletCardStyle.flat, name: 'Flat'},
  {value: WalletCardStyle.gradient, name: 'Gradient'},
];

const cardWidth = Dimensions.get('window').width - 72;

export const SettingsAccountStyleScreen = ({
  navigation,
  route,
}: SettingsAccountStyleScreenProps) => {
  const wallet = useWallet(route.params.address) as Wallet;
  const [cardStyle, setCardStyle] = useState<WalletCardStyle>(
    wallet.cardStyle || WalletCardStyle.flat,
  );

  const [colors, setColors] = useState([
    wallet.colorFrom,
    wallet.colorTo,
    wallet.colorPattern,
  ]);

  const onChangeType = useCallback(
    value => {
      if (value !== cardStyle) {
        setCardStyle(value);
        const newColors =
          value === WalletCardStyle.flat
            ? generateFlatColors()
            : generateGradientColors();

        setColors(
          newColors.map(color => HSBToHEX(color[0], color[1], color[2])),
        );
      }
    },
    [cardStyle],
  );

  const onPressGenerate = useCallback(() => {
    const newColors =
      cardStyle === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();

    setColors(newColors.map(color => HSBToHEX(color[0], color[1], color[2])));
  }, [cardStyle]);

  const onPressApply = useCallback(() => {
    wallet.updateWallet({
      colorFrom: colors[0],
      colorTo: colors[1],
      colorPattern: colors[2],
      cardStyle: cardStyle,
    });
    navigation.goBack();
  }, [cardStyle, colors, wallet]);

  return (
    <Container>
      <Card
        width={cardWidth}
        colorFrom={colors[0]}
        colorTo={colors[1]}
        colorPattern={colors[2]}
        style={page.card}
      />
      <Paragraph style={page.title}>Choose color style</Paragraph>
      <SegmentedControl
        value={cardStyle}
        values={variants}
        onChange={onChangeType}
      />
      <Spacer />
      <Button
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        title="Generate"
        onPress={onPressGenerate}
        style={page.button}
      />
      <Button
        variant={ButtonVariant.second}
        size={ButtonSize.middle}
        title="Use this style"
        onPress={onPressApply}
        style={page.button}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 23,
    fontWeight: '600',
    color: TEXT_BASE_1,
  },
  button: {
    marginVertical: 8,
  },
});
