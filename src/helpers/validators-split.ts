import {Validator} from '@evmos/provider';

import {validatorStatus} from '@app/helpers/validator-status';
import {ValidatorStatus} from '@app/types';

export function validatorsSplit(validatorsList: Validator[]) {
  const active = [];
  const inactive = [];
  const jailed = [];

  if (validatorsList?.length) {
    for (const validator of validatorsList) {
      switch (validatorStatus(validator)) {
        case ValidatorStatus.active:
          active.push({...validator, localStatus: ValidatorStatus.active});
          break;
        case ValidatorStatus.inactive:
          inactive.push({...validator, localStatus: ValidatorStatus.inactive});
          break;
        case ValidatorStatus.jailed:
          jailed.push({...validator, localStatus: ValidatorStatus.jailed});
          break;
      }
    }
  }

  return {
    active,
    inactive,
    jailed,
  };
}
