import {AppStore} from '@app/models/app';

export enum Feature {
  sss,
  earn,
  governanceAndStaking,
  tokens,
  // right to left
  rtl,
  removeSss,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return AppStore.isOauthEnabled;
    case Feature.earn:
      return true;
    case Feature.governanceAndStaking:
      return AppStore.isDeveloperModeEnabled;
    case Feature.tokens:
      return true;
    case Feature.rtl:
      return false;
    case Feature.removeSss:
      return false;
    default:
      return false;
  }
};

export const isEveryFeaturesEnabled = (features: Feature[]): boolean => {
  return features.every(feature => isFeatureEnabled(feature));
};
