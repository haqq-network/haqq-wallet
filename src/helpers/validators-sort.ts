import {ValidatorItem} from '@app/types';

export function validatorsSort(validators: ValidatorItem[]) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return Number.parseInt(valB.tokens, 10) - Number.parseInt(valA.tokens, 10);
  });
}
