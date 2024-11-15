import {app} from '@app/contexts';
import {AppStore} from '@app/models/app';

export enum Feature {
  sss,
  earn,
  governanceAndStaking,
  tokens,
  // right to left
  rtl,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return app.isOathSigninSupported;
    case Feature.earn:
      return true;
    case Feature.governanceAndStaking:
      return AppStore.isDeveloperModeEnabled;
    case Feature.tokens:
      return true;
    case Feature.rtl:
      return false;
    default:
      return false;
  }
};

export const isEveryFeaturesEnabled = (features: Feature[]): boolean => {
  return features.every(feature => isFeatureEnabled(feature));
};
