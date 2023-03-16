import React from 'react';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type SignupNetworkExistsProps = {
  onRestore: () => void;
  onRewrite: () => void;
};

export const SignupNetworkExists = ({
  onRestore,
  onRewrite,
}: SignupNetworkExistsProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Spacer />

      <Button
        i18n={I18N.signupNetworkExistsRestore}
        onPress={onRestore}
        variant={ButtonVariant.contained}
      />
      <Spacer height={16} />
      <Button
        i18n={I18N.signupNetworkExistsRewrite}
        onPress={onRewrite}
        variant={ButtonVariant.text}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
