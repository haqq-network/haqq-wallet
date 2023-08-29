import React, {memo} from 'react';

import {ModalController} from '@app/helpers';
import {HomeStack} from '@app/screens/HomeStack';
import {ModalsScreen} from '@app/screens/modals-screen';
import {WelcomeStack} from '@app/screens/WelcomeStack';

type Props = {
  onboarded: boolean;
  isPinReseted: boolean;
  isWelcomeNewsEnabled: boolean;
  isReady: boolean;
};

const RootStack = memo(
  ({onboarded, isPinReseted, isWelcomeNewsEnabled, isReady}: Props) => {
    ModalController.init();

    if (!isReady) {
      return <ModalsScreen initialModal={{type: 'splash'}} />;
    }

    if (onboarded && !isPinReseted) {
      return <HomeStack />;
    }

    return <WelcomeStack isWelcomeNewsEnabled={isWelcomeNewsEnabled} />;
  },
);

export {RootStack};
