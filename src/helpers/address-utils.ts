import converter from 'bech32-converting';
import {utils} from 'ethers';

import {AddressCosmosHaqq, AddressEthereum, AddressType} from '@app/types';
import {splitAddress} from '@app/utils';

import {Whitelist} from './whitelist';

export const HAQQ_VALIDATOR_PREFIX = 'haqqvaloper';
export class AddressUtils {
  static toHaqq(address: string): AddressCosmosHaqq {
    try {
      if (!address) {
        return '' as AddressCosmosHaqq;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return (address || '').toLowerCase() as AddressCosmosHaqq;
      }
      if (AddressUtils.isHaqqAddress(address)) {
        return address.toLowerCase() as AddressCosmosHaqq;
      }
      return converter('haqq')
        .toBech32(address)
        .toLowerCase() as AddressCosmosHaqq;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toHaqq', {address});
      return address as AddressCosmosHaqq;
    }
  }

  static toEth(address: string) {
    try {
      if (!address) {
        return '' as AddressEthereum;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return (address || '').toLowerCase() as AddressEthereum;
      }
      if (AddressUtils.isEthAddress(address)) {
        return address.toLowerCase() as AddressEthereum;
      }
      return converter('haqq').toHex(address).toLowerCase() as AddressEthereum;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toEth', {address});
      return address as AddressEthereum;
    }
  }

  static isEthAddress(address: string): address is AddressEthereum {
    try {
      if (!address) {
        return false;
      }
      return utils.isAddress(address);
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isEthAddress', {address});
      return false;
    }
  }

  static isHaqqValidatorAddress = (address: string) => {
    return (
      typeof address === 'string' && address.startsWith(HAQQ_VALIDATOR_PREFIX)
    );
  };

  static isHaqqAddress = (address: string): address is AddressCosmosHaqq => {
    try {
      if (!address) {
        return false;
      }
      if (typeof address === 'string' && address.startsWith('haqq')) {
        if (AddressUtils.isHaqqValidatorAddress(address)) {
          return true;
        }
        const hex = AddressUtils.toEth(address as AddressCosmosHaqq);
        return AddressUtils.isEthAddress(hex);
      }
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isHaqqAddress', {address});
    }
    return false;
  };

  static isValidAddress = (address: string) => {
    return (
      AddressUtils.isEthAddress(address) || AddressUtils.isHaqqAddress(address)
    );
  };

  static isContractAddress = async (address: string) => {
    try {
      if (!address) {
        return false;
      }
      const response = await Whitelist.verifyAddress(address);

      if (!response) {
        return false;
      }

      return response.address_type === AddressType.contract;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isContractAddress', {address});
      return false;
    }
  };

  static equals = (a: string, b: string) => {
    return AddressUtils.toEth(a) === AddressUtils.toEth(b);
  };

  static splitAddress = (address: string) => {
    return splitAddress(address);
  };
}

export const NATIVE_TOKEN_ADDRESS = AddressUtils.toEth(
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
);
