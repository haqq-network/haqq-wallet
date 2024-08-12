import {utils} from 'ethers';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {Contracts} from '@app/models/contracts';
import {Token} from '@app/models/tokens';
import {Balance} from '@app/services/balance';

import {ABI_ERC20_TRANSFER_ACTION} from './types';

export const getERC20TransferData = (
  to: string,
  amount: Balance,
  contractAddress: string,
) => {
  try {
    const abi = [ABI_ERC20_TRANSFER_ACTION];
    const iface = new utils.Interface(abi);

    const haqqContractAddress = AddressUtils.toHaqq(contractAddress);
    const contractInfo =
      Contracts.getById(haqqContractAddress) ||
      Token.getById(haqqContractAddress);

    const decimals = contractInfo.decimals ?? app.provider.decimals;

    const [amountClear] = new Balance(amount.toWei(), 0)
      .operate(Math.pow(10, amount.getPrecission()), 'div')
      .operate(Math.pow(10, decimals), 'mul')
      .toWei()
      .toString()
      .split('.');

    return iface.encodeFunctionData(ABI_ERC20_TRANSFER_ACTION.name, [
      to,
      amountClear,
    ]);
  } catch (err) {
    Logger.log('estimateERC20Transfer', err);
  }
};
