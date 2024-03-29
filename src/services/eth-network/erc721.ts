import {utils} from 'ethers';

import {ABI_ERC721_TRANSFER_FROM_ACTION} from './types';

export const getERC721TransferData = (
  from: string,
  to: string,
  tokenId: number,
) => {
  const abi = [ABI_ERC721_TRANSFER_FROM_ACTION];
  const iface = new utils.Interface(abi);

  return iface.encodeFunctionData(ABI_ERC721_TRANSFER_FROM_ACTION.name, [
    from,
    to,
    tokenId,
  ]);
};
