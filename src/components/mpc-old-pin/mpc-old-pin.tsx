import React from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {PopupContainer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type RestoreAgreementProps = {
  onPin: (pin: string) => void;
  pinRef: React.MutableRefObject<PinInterface | undefined>;
};

export const MpcOldPin = ({onPin, pinRef}: RestoreAgreementProps) => {
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
