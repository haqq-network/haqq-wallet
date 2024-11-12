import React from 'react';

import {Image, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {SssProviders} from '@app/services/provider-sss';

export type SssMigrateAgreementProps = {
  provider: SssProviders;
  email?: string;
  onCancel: () => void;
};

export const SssMigrateRewrite = ({
  provider,
  email,
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
          variant={TextVariant.t4}
          position={TextPosition.center}
          i18n={I18N.sssMigrateRewriteTitle}
          i18params={{provider, email: email || ''}}
        />
        <Spacer height={5} />
        <Text
          variant={TextVariant.t11}
          color={Color.textBase2}
          position={TextPosition.center}
          i18n={I18N.sssMigrateRewriteDescription}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          variant={ButtonVariant.contained}
          i18n={I18N.sssMigrateRewriteCancel}
          onPress={onCancel}
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
    paddingHorizontal: 20,
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
