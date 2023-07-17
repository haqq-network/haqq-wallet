import * as process from 'process';

import {ethers} from 'ethers';

export const PIN = '123456';
export const PROVIDER = ethers.getDefaultProvider(process.env.DETOX_PROVIDER);
export const SOURCE_WALLET = process.env.DETOX_MILK_PRIVATE_KEY ?? '';
