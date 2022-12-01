import React, {useEffect} from 'react';

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
import {WalletCardPattern, WalletCardStyle} from '@app/types';

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
  cardStyle,
  colors,
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
