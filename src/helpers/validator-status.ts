import {Validator} from '@evmos/provider';
import {bondStatusFromJSON} from 'cosmjs-types/cosmos/staking/v1beta1/staking';

import {ValidatorStatus} from '@app/types';

export function validatorStatus(validator: Validator): ValidatorStatus {
  if (validator.jailed) {
    return ValidatorStatus.jailed;
  }

  if (bondStatusFromJSON(validator.status) === 3) {
    return ValidatorStatus.active;
  }

  return ValidatorStatus.inactive;
}
