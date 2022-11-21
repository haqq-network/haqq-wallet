import {Validator} from '@evmos/provider';
import {bondStatusFromJSON} from 'cosmjs-types/cosmos/staking/v1beta1/staking';

import {ValidatorStatus} from '@app/types';

// TODO: add correct typings
export function validatorsSplit(validatorsList: Validator[]) {
  const active = [];
  const inactive = [];
  const jailed = [];

  if (validatorsList?.length) {
    for (const validator of validatorsList) {
      if (validator.jailed) {
        jailed.push({...validator, status: ValidatorStatus.jailed});
      } else if (bondStatusFromJSON(validator.status) === 3) {
        active.push({...validator, status: ValidatorStatus.active});
      } else {
        inactive.push({...validator, status: ValidatorStatus.inactive});
      }
    }
  }

  return {
    active,
    inactive,
    jailed,
  };
}
