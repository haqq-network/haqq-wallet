import converter from 'bech32-converting';
import {utils} from 'ethers';

import {AddressType, HaqqCosmosAddress, HaqqEthereumAddress} from '@app/types';

import {Whitelist} from './whitelist';

export const HAQQ_VALIDATOR_PREFIX = 'haqqvaloper';
export class AddressUtils {
  static toHaqq(address: string) {
    try {
      if (!address) {
        return '' as HaqqCosmosAddress;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return (address || '').toLowerCase() as HaqqCosmosAddress;
      }
      if (AddressUtils.isHaqqAddress(address)) {
        return address.toLowerCase() as HaqqCosmosAddress;
      }
      return converter('haqq')
        .toBech32(address)
        .toLowerCase() as HaqqCosmosAddress;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toHaqq', {address});
      return address as HaqqCosmosAddress;
    }
  }

  static toEth(address: string) {
    try {
      if (!address) {
        return '' as HaqqEthereumAddress;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return (address || '').toLowerCase() as HaqqEthereumAddress;
      }
      if (AddressUtils.isEthAddress(address)) {
        return address.toLowerCase() as HaqqEthereumAddress;
      }
      return converter('haqq')
        .toHex(address)
        .toLowerCase() as HaqqEthereumAddress;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toEth', {address});
      return address as HaqqEthereumAddress;
    }
  }

  static isEthAddress(address: string): address is HaqqEthereumAddress {
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

  static isHaqqAddress = (address: string): address is HaqqCosmosAddress => {
    try {
      if (!address) {
        return false;
      }
      if (typeof address === 'string' && address.startsWith('haqq')) {
        if (AddressUtils.isHaqqValidatorAddress(address)) {
          return true;
        }
        const hex = AddressUtils.toEth(address as HaqqCosmosAddress);
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
}
