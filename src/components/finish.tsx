import React, {useMemo} from 'react';

import {StyleSheet} from 'react-native';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';

export type FinishProps = {
  title: I18N;
  i18params?: Record<string, string>;
  onFinish: () => void;
  testID?: string;
};

export const Finish = ({onFinish, testID, title}: FinishProps) => {
  const theme = useTheme();
  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('@assets/animations/success-animation-dark.json');
    }

    return require('@assets/animations/success-animation-light.json');
  }, [theme]);

  return (
    <PopupContainer testID={testID}>
      <Spacer>
        <LottieWrap
          style={styles.animation}
          source={animation}
          autoPlay={true}
          loop={false}
        />
        <Text
          variant={TextVariant.t4}
          i18n={title}
          style={styles.title}
          testID={`${testID}_title`}
        />
      </Spacer>
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
  animation: {
    height: 380,
    width: 380,
  },
  title: {
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
