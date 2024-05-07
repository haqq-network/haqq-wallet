import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  InfoBlock,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';

export type SssMigrateAgreementProps = {
  onDone: () => void;
};

export const SssMigrateAgreement = ({onDone}: SssMigrateAgreementProps) => {
  const animation = useThemeSelector({
    dark: require('@assets/animations/social-list-dark.json'),
    light: require('@assets/animations/social-list-light.json'),
  });

  return (
    <PopupContainer style={page.container}>
      <Spacer centered>
        <LottieWrap style={page.animation} source={animation} autoPlay loop />
      </Spacer>
      <View style={page.content}>
        <Text center t4 i18n={I18N.sssMigrateAgrementTitle} />
        <Spacer height={20} />
        <InfoBlock
          icon={<Icon name="warning" color={Color.textYellow1} />}
          warning
          i18n={I18N.sssMigrateAgrementWarning1}
        />
        <Spacer height={20} />
        <InfoBlock
          icon={<Icon name="warning" color={Color.textYellow1} />}
          warning
          i18n={I18N.sssMigrateAgrementWarning2}
        />
        <Spacer height={20} />
      </View>
      <Spacer />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.ledgerAgreementAgree}
        onPress={onDone}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  animation: {
    height: 184,
    width: 375,
  },
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  content: {
    width: '100%',
  },
  submit: {marginBottom: 16, width: '100%'},
});
