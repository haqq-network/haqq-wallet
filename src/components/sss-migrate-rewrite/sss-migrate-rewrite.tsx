import React, {useCallback, useState} from 'react';

import {Image, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
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
  const [showWarning, setShowWarning] = useState(false);
  const hideWarningModal = useCallback(() => {
    setShowWarning(false);
  }, []);
  const onPress = useCallback(() => {
    hideWarningModal();
    onDone();
  }, []);
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
          onPress={() => setShowWarning(true)}
        />
      </View>

      {!!showWarning && (
        <BottomSheet
          fullscreen
          onClose={hideWarningModal}
          i18nTitle={I18N.sssReplaceAccountTitle}>
          <Text
            i18n={I18N.sssReplaceAccountDescription1}
            i18params={{provider: provider.toLocaleUpperCase()}}
            color={Color.textBase2}
            t14
            showChildren>
            <Text
              t12
              i18n={I18N.sssReplaceAccountDescription2}
              color={Color.textBase2}
            />
          </Text>
          <Button
            i18n={I18N.sssReplaceAccountButton}
            onPress={onPress}
            variant={ButtonVariant.text}
            textColor={Color.textRed1}
            style={styles.button}
            timer={3}
          />
        </BottomSheet>
      )}
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
