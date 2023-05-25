import {app} from '@app/contexts';

export enum Feature {
  sss,
  earn,
  walletConnectSign,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return false && app.isOathSigninSupported;
    case Feature.earn:
      return false;
    case Feature.walletConnectSign:
      return false;
    default:
      return false;
  }
};
