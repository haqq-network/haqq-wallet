export const ABI_ERC721_TRANSFER_FROM_ACTION = {
  name: 'transferFrom',
  type: 'function',
  constant: false,
  inputs: [
    {
      internalType: 'address',
      name: 'from',
      type: 'address',
    },
    {
      internalType: 'address',
      name: 'to',
      type: 'address',
    },
    {
      internalType: 'uint256',
      name: 'tokenId',
      type: 'uint256',
    },
  ],
  outputs: [],
  payable: false,
  stateMutability: 'nonpayable',
};

export const ABI_ERC20_TRANSFER_ACTION = {
  name: 'transfer',
  type: 'function',
  inputs: [
    {
      name: '_to',
      type: 'address',
    },
    {
      type: 'uint256',
      name: '_tokens',
    },
  ],
  constant: false,
  outputs: [],
  payable: false,
};

export const BALANCE_CACHE_KEY = 'balance_storage';
