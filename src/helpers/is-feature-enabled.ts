import {IS_MPC_ENABLED} from '@env';

import {app} from '@app/contexts';

export enum Feature {
  mpc,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.mpc:
      return IS_MPC_ENABLED === '1' && app.isOathSigninSupported;
    default:
      return false;
  }
};
