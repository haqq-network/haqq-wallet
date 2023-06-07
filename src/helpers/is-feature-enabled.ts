import {app} from '@app/contexts';

export enum Feature {
  sss,
  earn,
  walletConnectSign,
  governanceAndStaking,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return app.isOathSigninSupported;
    case Feature.earn:
      return app.isDeveloper;
    case Feature.walletConnectSign:
      return false;
    case Feature.governanceAndStaking:
      return app.isDeveloper;
    default:
      return false;
  }
};
