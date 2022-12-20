import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useWindowDimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  PopupContainer,
  SegmentedControl,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {WalletCardPattern, WalletCardStyle} from '@app/types';
import {generateFlatColors, generateGradientColors} from '@app/utils';
import {CARD_CIRCLE_TOTAL, CARD_RHOMBUS_TOTAL} from '@app/variables/common';

const cardStyleVariants = [
  {
    value: WalletCardStyle.flat,
    name: 'Flat',
    i18nName: I18N.settingsAccountStyleFlat,
  },
  {
    value: WalletCardStyle.gradient,
    name: 'Gradient',
    i18nName: I18N.settingsAccountStyleGenerate,
  },
];

const patternVariants = [
  {
    value: WalletCardPattern.circle,
    name: 'Circle',
    i18nName: I18N.settingsAccountStyleCircle,
  },
  {
    value: WalletCardPattern.rhombus,
    name: 'Rhombus',
    i18nName: I18N.settingsAccountStyleRhombus,
  },
];

type SettingsAccountStyleProps = {
  onPressApply: () => void;
  patternStyle: WalletCardPattern;
  colors: string[];
  cardStyle: WalletCardStyle;
  pattern: string;
  setPattern: (value: string) => void;
  setColors: (value: string[]) => void;
  setPatternStyle: (value: WalletCardPattern) => void;
  setCardStyle: (value: WalletCardStyle) => void;
  wallet: Wallet;
};

export const SettingsAccountStyle = ({
  onPressApply,
  patternStyle,
  cardStyle,
  colors,
  pattern,
  setPattern,
  setColors,
  setPatternStyle,
  setCardStyle,
  wallet,
}: SettingsAccountStyleProps) => {
  const opacity = useSharedValue(1);
  const heightCard = 192;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cardWidth = useWindowDimensions().width - 72;
  const [loading, setLoading] = useState<boolean>(false);
  const [isStyleChanged, setIsStyleChanged] = useState(false);

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
  }, [cardStyle, patternStyle, setColors, setPattern]);

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
        if (patternStyle !== value) {
          opacity.value = withTiming(0.5, {duration: 250}, finished => {
            if (finished) {
              opacity.value = withTiming(1, {duration: 250});
            }
          });
        }
      }
    },
    [pattern, opacity, patternStyle, setPattern, setPatternStyle],
  );

  const onChangeType = useCallback(
    (value: WalletCardStyle) => {
      setCardStyle(value);
      const newColors =
        value === WalletCardStyle.flat
          ? generateFlatColors()
          : generateGradientColors();

      setColors(newColors);
    },
    [setCardStyle, setColors],
  );
  return (
    <PopupContainer style={styles.container}>
      <Animated.View style={animatedStyles}>
        <Card
          width={cardWidth}
          height={heightCard}
          pattern={pattern}
          colorFrom={colors[0]}
          colorTo={colors[1]}
          colorPattern={colors[2]}
          style={styles.card}
        />
      </Animated.View>
      <Text
        t10
        i18n={I18N.settingsAccountStyleChoseColor}
        style={styles.title}
      />
      <SegmentedControl
        value={cardStyle}
        values={cardStyleVariants}
        onChange={onChangeType}
        style={styles.margin}
      />
      <Text
        t10
        i18n={I18N.settingsAccountStyleChoseColor}
        style={styles.title}
      />
      <SegmentedControl
        value={patternStyle}
        values={patternVariants}
        onChange={onChangePattern}
      />
      <Spacer />
      <Button
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        i18n={I18N.settingsAccountStyleGenerate}
        onPress={onPressGenerate}
        style={styles.button}
        loading={loading}
      />
      <Button
        variant={ButtonVariant.second}
        size={ButtonSize.middle}
        i18n={
          isStyleChanged
            ? I18N.settingsAccountStyleUseStyle
            : I18N.settingsAccountStyleAlreadyUsed
        }
        disabled={!isStyleChanged}
        onPress={onPressApply}
        style={styles.button}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
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
    color: Color.textBase1,
  },
  button: {
    marginVertical: 8,
  },
  margin: {marginBottom: 32},
});
