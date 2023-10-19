import {ValidatorItem} from '@app/types';

/**
 * @name setValidatorsPower
 * @description Add power in percents to validator items from validatorList
 * @param {ValidatorItem[]} validatorsList
 * @param {number} totalActiveTokens
 * @return ValidatorItem[]
 */
export function setValidatorsPower(
  validatorsList: ValidatorItem[],
  totalActiveTokens: number,
): ValidatorItem[] {
  return validatorsList.map(validator => ({
    ...validator,
    power: (Number.parseInt(validator.tokens, 10) / totalActiveTokens) * 100,
  }));
}
