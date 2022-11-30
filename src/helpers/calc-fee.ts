import {BigNumberish} from 'ethers';

import {WEI} from '@app/variables';

export function calcFee(gasPrice: BigNumberish, gasUsed: BigNumberish): number {
  return (Number(gasPrice) * Number(gasUsed)) / WEI;
}
