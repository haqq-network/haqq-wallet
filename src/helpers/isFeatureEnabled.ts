import {IS_MPC_ENABLED} from '@env';

export enum Feature {
  mpc,
}

export const isFeatureEnabled = (feature: Feature): boolean => {
  switch (feature) {
    case Feature.mpc:
      return IS_MPC_ENABLED === 'true' || IS_MPC_ENABLED === '1';
    default:
      return false;
  }
};
