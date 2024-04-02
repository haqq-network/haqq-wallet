import Config from 'react-native-config';

import {app} from '@app/contexts';

export enum Feature {
  sss,
  earn,
  governanceAndStaking,
  nft,
  tokens,
  // right to left
  rtl,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return Config.IS_SSS_ENABLED === 'true' && app.isOathSigninSupported;
    case Feature.earn:
      return true;
    case Feature.governanceAndStaking:
      return app.isDeveloper;
    case Feature.nft:
      return Config.IS_NFT_ENABLED === 'true';
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

export const isSomeFeaturesEnabled = (features: Feature[]): boolean => {
  return features.some(feature => isFeatureEnabled(feature));
};
