import {Balance} from '../balance';

export const ABI_ERC721_TRANSFER_FROM_ACTION = {
  name: 'safeTransferFrom',
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

export const ABI_ERC1155_TRANSFER_ACTION = {
  name: 'safeTransferFrom',
  type: 'function',
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
      name: 'id',
      type: 'uint256',
    },
    {
      internalType: 'uint256',
      name: 'amount',
      type: 'uint256',
    },
    {
      internalType: 'bytes',
      name: 'data',
      type: 'bytes',
    },
  ],
  outputs: [],
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

export type FeeValues = {
  low: Balance;
  average: Balance;
  high: Balance;
};

export type CalculatedFees = {
  gasLimit: Balance;
  gasPrice: FeeValues;
  fee: FeeValues;
};
