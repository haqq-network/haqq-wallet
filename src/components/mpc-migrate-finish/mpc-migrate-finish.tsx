import React, {useEffect} from 'react';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

type MpcMigrateFinishProps = {
  onSubmit: () => void;
};

export const MpcMigrateFinish = ({onSubmit}: MpcMigrateFinishProps) => {
  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  const animation = useThemeSelector({
    dark: require('@assets/animations/social-backup-finished-dark.json'),
    light: require('@assets/animations/social-backup-finished-light.json'),
  });

  return (
    <PopupContainer style={page.popupContainer}>
      <Spacer centered height={260}>
        <LottieWrap
          style={page.animation}
          source={animation}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Spacer flex={1} />
      <Text center t4 i18n={I18N.mpcMigrateFinishText} />
      <Spacer flex={1} />
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        i18n={I18N.backupFinishFinish}
        onPress={onSubmit}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  animation: {
    height: 260,
    width: 260,
  },
  popupContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    flex: 1,
  },
  button: {
    marginVertical: 16,
    width: '100%',
  },
});
