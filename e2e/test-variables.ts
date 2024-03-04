import 'dotenv/config';
import * as process from 'process';

import {ethers} from 'ethers';

export const PIN = '123456';
export const SOURCE_WALLET = process.env.DETOX_MILK_PRIVATE_KEY ?? '';
export const PROVIDER = new ethers.providers.StaticJsonRpcProvider(
  process.env.DETOX_PROVIDER,
  {
    chainId: Number(process.env.DETOX_CHAIN_ID!),
    name: process.env.DETOX_PROVIDER!,
  },
);
