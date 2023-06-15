import React from 'react';

import {Image, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {SssProviders} from '@app/services/provider-sss';

export type SssMigrateAgreementProps = {
  provider: SssProviders;
  email?: string;
  onDone: () => void;
  onCancel: () => void;
};

export const SssMigrateRewrite = ({
  provider,
  email,
  onDone,
  onCancel,
}: SssMigrateAgreementProps) => {
  return (
    <PopupContainer style={styles.container}>
      <View>
        <Image
          source={require('@assets/images/exclamation-mark-error.png')}
          style={styles.img}
        />
        <Spacer height={44} />
        <Text
          t4
          center
          i18n={I18N.sssMigrateRewriteTitle}
          i18params={{provider, email: email || ''}}
        />
        <Spacer height={5} />
        <Text
          t11
          color={Color.textBase2}
          center
          i18n={I18N.sssMigrateRewriteDescription}
        />
        <Spacer height={5} />
        <Text
          t11
          color={Color.textRed1}
          center
          i18n={I18N.sssMigrateRewriteWarning}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          variant={ButtonVariant.contained}
          i18n={I18N.sssMigrateRewriteCancel}
          onPress={onCancel}
        />
        <Button
          style={styles.button}
          variant={ButtonVariant.text}
          textColor={Color.textRed1}
          i18n={I18N.sssMigrateRewriteRewrite}
          onPress={onDone}
        />
      </View>
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  img: {
    height: 136,
    width: 136,
    alignSelf: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  button: {
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
});
