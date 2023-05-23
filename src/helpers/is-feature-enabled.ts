import {app} from '@app/contexts';

export enum Feature {
  sss,
  earn,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return false && app.isOathSigninSupported;
    case Feature.earn:
      return false;
    default:
      return false;
  }
};
