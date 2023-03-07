import React, {useCallback, useState} from 'react';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type MpcNetworksProps = {
  onLoginAuth0: () => Promise<void>;
};

export const MpcNetworks = ({onLoginAuth0}: MpcNetworksProps) => {
  const [isAuth0, setIsAuth0] = useState(false);

  const onPressLoginGithub = useCallback(async () => {
    try {
      setIsAuth0(true);

      await onLoginAuth0();
    } finally {
      setIsAuth0(false);
    }
  }, [onLoginAuth0]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer />
      <Button
        title="Login with Auth0"
        loading={isAuth0}
        onPress={onPressLoginGithub}
        variant={ButtonVariant.contained}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
