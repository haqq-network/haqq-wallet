import React from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {PopupContainer} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {createTheme} from '@app/theme';

export type RestoreAgreementProps = {
  onPin: (pin: string) => void;
  pinRef: React.MutableRefObject<PinInterface | undefined>;
};

export const SssPin = ({onPin, pinRef}: RestoreAgreementProps) => {
  return (
    <PopupContainer style={styles.container}>
      <Pin title={I18N.signinOldPinTitle} onPin={onPin} ref={pinRef} />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'flex-end',
  },
});
