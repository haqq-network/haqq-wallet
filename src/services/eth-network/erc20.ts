import {utils} from 'ethers';

import {AddressUtils} from '@app/helpers/address-utils';
import {Contracts} from '@app/models/contracts';
import {Provider} from '@app/models/provider';
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
      Token.getById(haqqContractAddress) ||
      Contracts.getById(haqqContractAddress);

    const decimals =
      contractInfo.decimals ?? Provider.selectedProvider.decimals;

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
