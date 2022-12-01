import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useSharedValue, withTiming} from 'react-native-reanimated';

import {SettingsAccountStyle} from '@app/components/settings-account-style';
import {useWallet} from '@app/hooks';
import {useTypedNavigation} from '@app/hooks';
import {useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {WalletCardPattern, WalletCardStyle} from '@app/types';
import {generateFlatColors, generateGradientColors} from '@app/utils';
import {CARD_CIRCLE_TOTAL, CARD_RHOMBUS_TOTAL} from '@app/variables';

export const SettingsAccountStyleScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'settingsAccountStyle'>();

  const timerRef: {current: NodeJS.Timeout | null} = useRef(null);
  const [isStyleChanged, setIsStyleChanged] = useState(false);
  const opacity = useSharedValue(1);

  const [loading, setLoading] = useState<boolean>(false);

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

  const onChangeType = useCallback((value: WalletCardStyle) => {
    setCardStyle(value);
    const newColors =
      value === WalletCardStyle.flat
        ? generateFlatColors()
        : generateGradientColors();

    setColors(newColors);
  }, []);

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
    [pattern, opacity, patternStyle],
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
    <SettingsAccountStyle
      onPressGenerate={onPressGenerate}
      onPressApply={onPressApply}
      onChangePattern={onChangePattern}
      onChangeType={onChangeType}
      patternStyle={patternStyle}
      colors={colors}
      cardStyle={cardStyle}
      pattern={pattern}
      loading={loading}
      isStyleChanged={isStyleChanged}
    />
  );
};
