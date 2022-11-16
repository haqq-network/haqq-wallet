import React, {useCallback, useEffect, useRef, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Dimensions, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {useWallet} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  PopupContainer,
  SegmentedControl,
  Spacer,
  Text,
} from '../components/ui';
import {Wallet} from '../models/wallet';
import {RootStackParamList, WalletCardPattern, WalletCardStyle} from '../types';
import {generateFlatColors, generateGradientColors} from '../utils';
import {
  CARD_CIRCLE_TOTAL,
  CARD_RHOMBUS_TOTAL,
  LIGHT_TEXT_BASE_1,
} from '../variables';

const cardStyleVariants = [
  {value: WalletCardStyle.flat, name: 'Flat'},
  {value: WalletCardStyle.gradient, name: 'Gradient'},
];

const patternVariants = [
  {value: WalletCardPattern.circle, name: 'Circle'},
  {value: WalletCardPattern.rhombus, name: 'Rhombus'},
];

const cardWidth = Dimensions.get('window').width - 72;

export const SettingsAccountStyleScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'settingsAccountStyle'>>();

  const timerRef: {current: NodeJS.Timeout | null} = useRef(null);
  const [isStyleChanged, setIsStyleChanged] = useState(false);
  const opacity = useSharedValue(1);

  const [loading, setLoading] = useState<boolean>(false);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withTiming(loading ? 0.5 : 1, {duration: 500});
  }, [loading, opacity]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const wallet = useWallet(route.params.address) as Wallet;
  const [pattern, setPattern] = useState<string>(wallet.pattern);

  const [cardStyle, setCardStyle] = useState<WalletCardStyle>(
    wallet.cardStyle || WalletCardStyle.flat,
  );

  const [colors, setColors] = useState([
    wallet.colorFrom,
    wallet.colorTo,
    wallet.colorPattern,
  ]);

  const [patternStyle, setPatternStyle] = useState<WalletCardPattern>(
    wallet.pattern.startsWith(WalletCardPattern.circle)
      ? WalletCardPattern.circle
      : WalletCardPattern.rhombus,
  );

  const onChangeType = useCallback(
    (value: WalletCardStyle) => {
      if (value !== cardStyle) {
        setCardStyle(value);
        const newColors =
          value === WalletCardStyle.flat
            ? generateFlatColors()
            : generateGradientColors();

        setColors(newColors);
      }
    },
    [cardStyle],
  );

  const onChangePattern = useCallback(
    (value: WalletCardPattern) => {
      if (pattern !== value) {
        setPatternStyle(value);

        const newPattern = `${value}-${Math.floor(
          Math.random() *
            (value === WalletCardPattern.circle
              ? CARD_CIRCLE_TOTAL
              : CARD_RHOMBUS_TOTAL),
        )}`;

        setPattern(newPattern);
      }
    },
    [pattern],
  );

  const onPressGenerate = useCallback(() => {
    vibrate(HapticEffects.impactLight);
    setLoading(true);
    const newColors =
      cardStyle === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();

    const newPattern = `${patternStyle}-${Math.floor(
      Math.random() *
        (patternStyle === WalletCardPattern.circle
          ? CARD_CIRCLE_TOTAL
          : CARD_RHOMBUS_TOTAL),
    )}`;
    timerRef.current = setTimeout(() => {
      setPattern(newPattern);
      setColors(newColors);
      setLoading(false);
    }, 500);
  }, [cardStyle, patternStyle]);

  useEffect(() => {
    const {
      cardStyle: WCardStyle,
      colorFrom,
      colorTo,
      colorPattern,
      pattern: WPattern,
    } = wallet;
    if (
      WCardStyle !== cardStyle ||
      colors[0] !== colorFrom ||
      colors[1] !== colorTo ||
      colors[2] !== colorPattern ||
      WPattern !== pattern
    ) {
      !isStyleChanged && setIsStyleChanged(true);
    } else {
      isStyleChanged && setIsStyleChanged(false);
    }
  }, [isStyleChanged, colors, cardStyle, wallet, pattern]);

  const onPressApply = useCallback(() => {
    wallet.setCardStyle(cardStyle, colors[0], colors[1], colors[2], pattern);
    navigation.goBack();
  }, [cardStyle, colors, navigation, wallet, pattern]);

  return (
    <PopupContainer style={page.container}>
      <Animated.View style={animatedStyles}>
        <Card
          width={cardWidth}
          height={192}
          pattern={pattern}
          colorFrom={colors[0]}
          colorTo={colors[1]}
          colorPattern={colors[2]}
          style={page.card}
        />
      </Animated.View>
      <Text t10 style={page.title}>
        Choose color style
      </Text>
      <SegmentedControl
        value={cardStyle}
        values={cardStyleVariants}
        onChange={onChangeType}
        style={page.margin}
      />
      <Text t10 style={page.title}>
        Choose color style
      </Text>
      <SegmentedControl
        value={patternStyle}
        values={patternVariants}
        onChange={onChangePattern}
      />
      <Spacer />
      <Button
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        title="Generate"
        onPress={onPressGenerate}
        style={page.button}
        loading={loading}
      />
      <Button
        variant={ButtonVariant.second}
        size={ButtonSize.middle}
        title={isStyleChanged ? 'Use this style' : 'This style is used'}
        disabled={!isStyleChanged}
        onPress={onPressApply}
        style={page.button}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 23,
    fontWeight: '600',
    color: LIGHT_TEXT_BASE_1,
  },
  button: {
    marginVertical: 8,
  },
  margin: {marginBottom: 32},
});
