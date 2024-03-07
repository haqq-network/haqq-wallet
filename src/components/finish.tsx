import React, {useMemo} from 'react';

import {StyleSheet} from 'react-native';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {AppTheme, Theme} from '@app/theme';

export type FinishProps = {
  title: I18N;
  i18params?: Record<string, string>;
  onFinish: () => void;
  testID?: string;
};

export const Finish = ({onFinish, testID, title}: FinishProps) => {
  const animation = useMemo(() => {
    if (Theme.currentTheme === AppTheme.dark) {
      return require('@assets/animations/success-animation-dark.json');
    }

    return require('@assets/animations/success-animation-light.json');
  }, [Theme.currentTheme]);

  return (
    <PopupContainer testID={testID}>
      <Spacer>
        <LottieWrap source={animation} autoPlay={true} loop={false} />
      </Spacer>
      <Text t4 i18n={title} style={styles.title} testID={`${testID}_title`} />
      <Button
        style={styles.button}
        variant={ButtonVariant.contained}
        i18n={I18N.finishProceed}
        testID={`${testID}_finish`}
        onPress={onFinish}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 76,
    textAlign: 'center',
    width: 300,
    alignSelf: 'center',
    marginHorizontal: 20,
  },
  button: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
});
