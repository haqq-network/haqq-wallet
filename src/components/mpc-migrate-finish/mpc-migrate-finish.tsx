import React, {useEffect} from 'react';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

type MpcMigrateFinishProps = {
  onSubmit: () => void;
};

export const MpcMigrateFinish = ({onSubmit}: MpcMigrateFinishProps) => {
  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  return (
    <PopupContainer style={page.popupContainer}>
      <Spacer />
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
  popupContainer: {marginHorizontal: 20},
  button: {marginVertical: 16},
});
