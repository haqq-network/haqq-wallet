import React, {useEffect} from 'react';

import {StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
import {I18N} from '@app/i18n';
import {WalletCardPattern, WalletCardStyle} from '@app/types';
import {LIGHT_TEXT_BASE_1} from '@app/variables';

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
  onPressGenerate: () => void;
  onChangePattern: (value: WalletCardPattern) => void;
  onChangeType: (value: WalletCardStyle) => void;
  patternStyle: WalletCardPattern;
  colors: string[];
  cardStyle: WalletCardStyle;
  pattern: string;
  loading: boolean;
  isStyleChanged: boolean;
};

export const SettingsAccountStyle = ({
  onPressApply,
  onPressGenerate,
  onChangePattern,
  onChangeType,
  patternStyle,
  colors,
  cardStyle,
  pattern,
  loading,
  isStyleChanged,
}: SettingsAccountStyleProps) => {
  const opacity = useSharedValue(1);
  const heightCard = 192;
  const cardWidth = useWindowDimensions().width - 72;

  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withTiming(loading ? 0.5 : 1, {duration: 500});
  }, [loading, opacity]);

  return (
    <PopupContainer style={page.container}>
      <Animated.View style={animatedStyles}>
        <Card
          width={cardWidth}
          height={heightCard}
          pattern={pattern}
          colorFrom={colors[0]}
          colorTo={colors[1]}
          colorPattern={colors[2]}
          style={page.card}
        />
      </Animated.View>
      <Text t10 i18n={I18N.settingsAccountStyleChoseColor} style={page.title} />
      <SegmentedControl
        value={cardStyle}
        values={cardStyleVariants}
        onChange={onChangeType}
        style={page.margin}
      />
      <Text t10 i18n={I18N.settingsAccountStyleChoseColor} style={page.title} />
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
        style={page.button}
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
