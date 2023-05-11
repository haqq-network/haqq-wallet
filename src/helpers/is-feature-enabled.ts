import {app} from '@app/contexts';

export enum Feature {
  mpc,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.mpc:
      return app.isOathSigninSupported;
    default:
      return false;
  }
};
