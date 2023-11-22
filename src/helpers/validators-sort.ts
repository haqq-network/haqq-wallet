import {ValidatorItem} from '@app/types';

export enum ValidatorSortKey {
  random, // default
  nameAsc, // description.moniker
  nameDesc, // description.moniker
  powerAsc, // power || tokens
  powerDesc, // power || tokens
  commissionAsc, // localStatus
  commissionDesc, // localStatus
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
    case ValidatorSortKey.nameAsc:
      return validatorsSortName(validators);
    case ValidatorSortKey.nameDesc:
      return validatorsSortName(validators, -1);
    case ValidatorSortKey.commissionAsc:
      return validatorsSortCommission(validators);
    case ValidatorSortKey.commissionDesc:
      return validatorsSortCommission(validators, -1);
    case ValidatorSortKey.powerAsc:
      return validatorsSortPower(validators);
    case ValidatorSortKey.powerDesc:
      return validatorsSortPower(validators, -1);
    default:
      return validatorsSortRandom(validators);
  }
}

/**
 * @name validatorsSortPower
 * @description Sorting for validators based on total power
 * @param validators
 * @param desc {-1 | 1} 1 means asc sorting and -1 means desc sorting
 */
export function validatorsSortPower(
  validators: ValidatorItem[],
  desc: -1 | 1 = 1,
) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return (
      (Number.parseInt(valA.tokens, 10) - Number.parseInt(valB.tokens, 10)) *
      desc
    );
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
 * @param desc {-1 | 1} 1 means asc sorting and -1 means desc sorting
 */
export function validatorsSortName(
  validators: ValidatorItem[],
  desc: -1 | 1 = 1,
) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    return valB.description.moniker.toLowerCase() >
      valA.description.moniker.toLowerCase()
      ? -1 * desc
      : 1 * desc;
  });
}

/**
 * @name validatorsSortCommission
 * @description Sorting for validators based on commission
 * @param validators
 * @param desc {-1 | 1} 1 means asc sorting and -1 means desc sorting
 */
export function validatorsSortCommission(
  validators: ValidatorItem[],
  desc: -1 | 1 = 1,
) {
  return validators.sort((valA: ValidatorItem, valB: ValidatorItem) => {
    const a = valA.commission.commission_rates.rate;
    const b = valB.commission.commission_rates.rate;

    if (a === b) {
      return Math.random() - Math.random();
    }

    return (
      (parseFloat(valA.commission.commission_rates.rate) -
        parseFloat(valB.commission.commission_rates.rate)) *
      desc
    );
  });
}
