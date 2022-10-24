import {BigNumberish, utils} from 'ethers';

export function calcFee(gasPrice: BigNumberish, gasUsed: BigNumberish): number {
  return (
    Number(utils.formatEther(gasPrice)) *
    Number(utils.formatEther(gasUsed)) *
    1000000000000000000
  );
}
