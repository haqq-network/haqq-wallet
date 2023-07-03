import {IS_SSS_ENABLED} from '@env';

import {app} from '@app/contexts';

export enum Feature {
  sss,
  earn,
  governanceAndStaking,
  nft,
  abnews,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.sss:
      return IS_SSS_ENABLED === 'true' && app.isOathSigninSupported;
    case Feature.earn:
      return true;
    case Feature.governanceAndStaking:
      return app.isDeveloper;
    case Feature.nft:
      return app.isDeveloper;
    case Feature.abnews:
      return app.isWelcomeNewsEnabled;
    default:
      return false;
  }
};
