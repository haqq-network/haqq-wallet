import {app} from '@app/contexts';

export enum Feature {
  mpc,
  earn,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.mpc:
      return false && app.isOathSigninSupported;
    case Feature.earn:
      return false;
    default:
      return false;
  }
};
