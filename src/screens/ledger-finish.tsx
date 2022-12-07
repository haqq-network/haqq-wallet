import React, {useCallback} from 'react';

import {useApp, useTypedNavigation} from '@app/hooks';
import { LedgerFinish } from '@app/components/ledger-finish';

export const LedgerFinishScreen = () => {
  const app = useApp();
  const navigation = useTypedNavigation();
  const onEnd = useCallback(() => {
    if (app.getUser().onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.getUser().onboarded = true;
      navigation.replace('home');
    }
  }, [app, navigation]);

  return <LedgerFinish onEnd={onEnd} />
};
