import React from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';

import {CustomHeader} from '../ui';

interface PinGuardProps {
  onPin: (pin: string) => void;
  pinRef: React.MutableRefObject<PinInterface | undefined>;
  title?: I18N;
}

export const PinGuard = ({onPin, pinRef, title}: PinGuardProps) => {
  const {goBack} = useTypedNavigation();

  return (
    <>
      <CustomHeader onPressLeft={goBack} iconLeft="arrow_back" title={title} />
      <Pin title={I18N.settingsSecurityWalletPin} onPin={onPin} ref={pinRef} />
    </>
  );
};
