import converter from 'bech32-converting';
import {utils} from 'ethers';

import {AddressType, HaqqCosmosAddress, HaqqEthereumAddress} from '@app/types';

import {Whitelist} from './whitelist';

export class AddressUtils {
  static toHaqq(address: string) {
    if (AddressUtils.isHaqqAddress(address)) {
      return address.toLowerCase() as HaqqCosmosAddress;
    }
    return converter('haqq')
      .toBech32(address)
      .toLowerCase() as HaqqCosmosAddress;
  }

  static toEth(address: string) {
    if (AddressUtils.isEthAddress(address)) {
      return address.toLowerCase() as HaqqEthereumAddress;
    }
    return converter('haqq')
      .toHex(address)
      .toLowerCase() as HaqqEthereumAddress;
  }

  static isEthAddress(address: string): address is HaqqEthereumAddress {
    return utils.isAddress(address);
  }

  static isHaqqAddress = (address: string): address is HaqqCosmosAddress => {
    try {
      if (typeof address === 'string' && address.startsWith('haqq')) {
        const hex = AddressUtils.toEth(address as HaqqCosmosAddress);
        return AddressUtils.isEthAddress(hex);
      }
    } catch (e) {}

    return false;
  };

  static isValidAddress = (address: string) => {
    return (
      AddressUtils.isEthAddress(address) || AddressUtils.isHaqqAddress(address)
    );
  };

  static isContractAddress = async (address: string) => {
    const response = await Whitelist.verifyAddress(address);

    if (!response) {
      return false;
    }

    return response.addressType === AddressType.contract;
  };

  static equals = (a: string, b: string) => {
    return AddressUtils.toEth(a) === AddressUtils.toEth(b);
  };
}
