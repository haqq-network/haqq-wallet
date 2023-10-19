import {ValidatorItem} from '@app/types';

/**
 * @name validatorsSort
 * @description Totally random sorting for validators based on nothing
 * @param validators
 */
export function validatorsSort(validators: ValidatorItem[]) {
  return validators.sort(() => {
    const randomB = Math.random();
    const randomA = Math.random();
    return randomB - randomA;
  });
}
