import {ValidatorItem} from '@app/types';

/**
 * @name validatorsSort
 * @description Sorting for validators based on total power
 * @param validators
 */
export function validatorsSort(validators: ValidatorItem[]) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return Number.parseInt(valB.tokens, 10) - Number.parseInt(valA.tokens, 10);
  });
}

/**
 * @name randomValidatorsSort
 * @description Totally random sorting for validators based on nothing
 * @param validators
 */
export function randomValidatorsSort(validators: ValidatorItem[]) {
  return validators.sort(() => {
    const randomB = Math.random();
    const randomA = Math.random();
    return randomB - randomA;
  });
}
