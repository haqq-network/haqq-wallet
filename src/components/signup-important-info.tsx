import React, {memo} from 'react';

import {Platform, View} from 'react-native';
import Markdown from 'react-native-markdown-display';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Color, getColor} from '@app/theme';

type Props = {
  onNext: () => void;
  readMoreLink?: string;
};

const source = `
${getText(I18N.signupImportantInfoDesc1)}

${getText(I18N.signupImportantInfoDesc2)}

${getText(I18N.signupImportantInfoDesc3)}

${getText(I18N.signupImportantInfoDesc4)}
`;

// Extracted from Text component
const sfProDisplaySemibold600 = Platform.select({
  ios: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600' as '600',
  },
  android: {
    fontFamily: 'SF-Pro-Display-Semibold',
  },
});

const sfProTextRegular400 = Platform.select({
  ios: {
    fontFamily: 'SF Pro Display',
    fontWeight: '400' as '400',
  },
  android: {
    fontFamily: 'SF-Pro-Display-Regular',
  },
});

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
        <Markdown
          mergeStyle
          style={{
            strong: {
              ...sfProDisplaySemibold600,
              fontSize: 14,
              lineHeight: 18,
              color: getColor(Color.textBase1),
            },
            paragraph: {
              ...sfProTextRegular400,
              fontSize: 14,
              lineHeight: 18,
              color: getColor(Color.textBase2),
            },
          }}>
          {source}
        </Markdown>
        <Text
          t8
          i18n={I18N.signupImportantInfoDesc5}
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
