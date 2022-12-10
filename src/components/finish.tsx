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
import {useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppTheme} from '@app/types';

export type FinishProps = {
  title?: string;
  i18n?: I18N;
  i18params?: Record<string, string>;
  onFinish: () => void;
  testID?: string;
};

export const Finish = ({title, onFinish, testID, i18n}: FinishProps) => {
  const theme = useTheme();
  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('../../assets/animations/success-animation-dark.json');
    }

    return require('../../assets/animations/success-animation-light.json');
  }, [theme]);

  return (
    <PopupContainer>
      <Spacer>
        <LottieWrap source={animation} autoPlay loop={false} />
      </Spacer>
      <Text t4 i18n={i18n} style={styles.title}>
        {title}
      </Text>
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
