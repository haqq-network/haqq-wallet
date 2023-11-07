import {ValidatorItem} from '@app/types';

export enum ValidatorSortKey {
  random, // default
  name, // description.moniker
  power, // power || tokens
  commission, // localStatus
}

/**
 * @name validatorsSort
 * @description Sorting validators list based on key param
 * @param validators
 * @param key
 */
export function validatorsSort(
  validators: ValidatorItem[],
  key: ValidatorSortKey,
) {
  switch (key) {
    case ValidatorSortKey.random:
      return validatorsSortRandom(validators);
    case ValidatorSortKey.name:
      return validatorsSortName(validators);
    case ValidatorSortKey.commission:
      return validatorsSortCommission(validators);
    case ValidatorSortKey.power:
      return validatorsSortPower(validators);
    default:
      return validatorsSortRandom(validators);
  }
}

/**
 * @name validatorsSortPower
 * @description Sorting for validators based on total power
 * @param validators
 */
export function validatorsSortPower(validators: ValidatorItem[]) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return Number.parseInt(valB.tokens, 10) - Number.parseInt(valA.tokens, 10);
  });
}

/**
 * @name validatorsSortRandom
 * @description Totally random sorting for validators based on nothing
 * @param validators
 */
export function validatorsSortRandom(validators: ValidatorItem[]) {
  return validators.sort(() => {
    const randomB = Math.random();
    const randomA = Math.random();
    return randomB - randomA;
  });
}

/**
 * @name validatorsSortName
 * @description Sorting for validators based on name
 * @param validators
 */
export function validatorsSortName(validators: ValidatorItem[]) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return valB.description.moniker.toLowerCase() >
      valA.description.moniker.toLowerCase()
      ? -1
      : 1;
  });
}

/**
 * @name validatorsSortCommission
 * @description Sorting for validators based on commission
 * @param validators
 */
export function validatorsSortCommission(validators: ValidatorItem[]) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return (
      parseFloat(valB.commission.commission_rates.rate) -
      parseFloat(valA.commission.commission_rates.rate)
    );
  });
}
