import {BigNumberish} from 'ethers';

import {WEI} from '@app/variables/common';

export function calcFee(gasPrice: BigNumberish, gasUsed: BigNumberish): number {
  return calcFeeWei(gasPrice, gasUsed) / WEI;
}

export function calcFeeWei(gasPrice: BigNumberish, gasUsed: BigNumberish) {
  return Number(gasPrice) * Number(gasUsed);
}
