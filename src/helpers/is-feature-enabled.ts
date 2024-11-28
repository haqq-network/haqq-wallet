import {app} from '@app/contexts';

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
      return app.isOathSigninSupported;
    case Feature.earn:
      return true;
    case Feature.governanceAndStaking:
      return app.isDeveloper;
    case Feature.tokens:
      return true;
    case Feature.rtl:
      return false;
    case Feature.removeSss:
      return true;
    default:
      return false;
  }
};

export const isEveryFeaturesEnabled = (features: Feature[]): boolean => {
  return features.every(feature => isFeatureEnabled(feature));
};
