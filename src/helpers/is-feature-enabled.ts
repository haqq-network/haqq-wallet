import {IS_SSS_ENABLED, IS_STAKED_VESTED_ENABLED} from '@env';

import {app} from '@app/contexts';

export enum Feature {
  sss,
  earn,
  governanceAndStaking,
  nft,
  tokens,
  // right to left
  rtl,
  lockedStakedVestedTokens,
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
    case Feature.tokens:
      return app.isDeveloper;
    case Feature.rtl:
      return false;
    case Feature.lockedStakedVestedTokens:
      return IS_STAKED_VESTED_ENABLED === 'true' || app.isDeveloper;
    default:
      return false;
  }
};
