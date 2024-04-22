import {utils} from 'ethers';

import {
  ABI_ERC1155_TRANSFER_ACTION,
  ABI_ERC721_TRANSFER_FROM_ACTION,
} from './types';

export const getERC1155TransferData = (
  from: string,
  to: string,
  tokenId: number,
  amount: number = 1, // FIXME Implement it when BE with Design will be ready
) => {
  const abi = [ABI_ERC1155_TRANSFER_ACTION];
  const iface = new utils.Interface(abi);

  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(String(tokenId));

  return iface.encodeFunctionData(ABI_ERC721_TRANSFER_FROM_ACTION.name, [
    from,
    to,
    tokenId,
    amount,
    data,
  ]);
};
