import React, {useCallback, useState} from 'react';

import {Image} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {SssProviders} from '@app/services/provider-sss';
import {capitalize} from '@app/utils';

export type SignupNetworkExistsProps = {
  provider: SssProviders;
  email?: string;
  onRestore: () => void;
  onRewrite: () => void;
};

export const SignupNetworkExists = ({
  provider,
  email,
  onRestore,
  onRewrite,
}: SignupNetworkExistsProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const hideWarningModal = useCallback(() => {
    setShowWarning(false);
  }, []);
  const onPress = useCallback(() => {
    hideWarningModal();
    onRewrite();
  }, []);
  return (
    <PopupContainer style={styles.container}>
      <Image
        source={require('@assets/images/signup-network-exists-warning.png')}
        style={styles.img}
      />
      <Spacer height={44} />
      <Text
        t4
        center
        i18n={
          email
            ? I18N.signupNetworkExitsTitle
            : I18N.signupNetworkExitsTitleWithoutEmail
        }
        i18params={{provider, email: email || ''}}
      />
      <Spacer height={4} />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.signupNetworkExitsDescription1}
      />
      <Spacer height={4} />
      <Text
        t11
        color={Color.textRed1}
        center
        i18n={I18N.signupNetworkExitsDescription2}
      />
      <Spacer />
      <Button
        i18n={I18N.signupNetworkExistsRestore}
        onPress={onRestore}
        variant={ButtonVariant.contained}
      />
      <Spacer height={16} />
      <Button
        i18n={I18N.signupNetworkExistsRewrite}
        onPress={() => setShowWarning(true)}
        variant={ButtonVariant.text}
        textColor={Color.textRed1}
      />

      {!!showWarning && (
        <BottomSheet
          fullscreen
          onClose={hideWarningModal}
          i18nTitle={I18N.sssReplaceAccountTitle}>
          <Text
            i18n={I18N.sssReplaceAccountDescription1}
            i18params={{provider: capitalize(provider)}}
            color={Color.textBase2}
            t11
            showChildren>
            <Text
              t9
              i18n={I18N.sssReplaceAccountDescription2}
              color={Color.textBase2}
            />
          </Text>
          <Button
            error
            i18n={I18N.sssReplaceAccountButton}
            onPress={onPress}
            variant={ButtonVariant.second}
            textColor={Color.textRed1}
            style={styles.timerButton}
            timer={10}
          />
        </BottomSheet>
      )}
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  img: {
    height: 136,
    width: 136,
    alignSelf: 'center',
    marginVertical: 24,
  },
  timerButton: {
    marginTop: 16,
    marginBottom: 40,
  },
});
