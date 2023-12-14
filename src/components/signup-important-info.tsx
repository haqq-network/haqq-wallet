import React, {memo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

type Props = {
  onNext: () => void;
  readMoreLink?: string;
};

export const SignupImportantInfo = memo(({onNext, readMoreLink}: Props) => {
  return (
    <PopupContainer style={styles.container}>
      <Text
        t4
        center
        style={styles.title}
        i18n={I18N.signupImportantInfoTitle}
        color={Color.textRed1}
      />
      <View style={styles.textWrapper}>
        <Text
          t11
          i18n={I18N.signupImportantInfoDesc1_1}
          color={Color.textBase1}
          showChildren>
          <Text
            t10
            i18n={I18N.signupImportantInfoDesc1_2}
            color={Color.textBase2}
          />
        </Text>
        <Text
          t10
          i18n={I18N.signupImportantInfoDesc2_1}
          color={Color.textBase1}
          showChildren>
          <Text
            t10
            i18n={I18N.signupImportantInfoDesc2_2}
            color={Color.textBase2}
          />
        </Text>
        <Text
          t10
          i18n={I18N.signupImportantInfoDesc3_1}
          color={Color.textBase1}
          showChildren>
          <Text
            t10
            i18n={I18N.signupImportantInfoDesc3_2}
            color={Color.textBase2}
          />
        </Text>
        <Text
          t8
          i18n={I18N.signupImportantInfoDesc4}
          color={Color.textYellow1}
        />
      </View>
      <Spacer />
      {readMoreLink && (
        <Button
          testID={'important_info_read_more'}
          style={styles.submit}
          variant={ButtonVariant.third}
          i18n={I18N.signupImportantInfoSecondaryButton}
        />
      )}
      <Button
        testID={'important_info_continue'}
        style={styles.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.signupImportantInfoPrimaryButton}
        onPress={onNext}
        timer={3}
      />
    </PopupContainer>
  );
});

const styles = createTheme({
  textWrapper: {paddingHorizontal: 20},
  container: {
    justifyContent: 'flex-end',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
  },

  submit: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
});
