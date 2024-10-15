import converter from 'bech32-converting';
import {utils} from 'ethers';
import tron from 'tronweb';

import {
  AddressCosmos,
  AddressEthereum,
  AddressTron,
  AddressType,
} from '@app/types';
import {splitAddress} from '@app/utils';

import {Whitelist} from './whitelist';

export const HAQQ_VALIDATOR_PREFIX = 'haqqvaloper';
export class AddressUtils {
  static toTron(address: string): AddressTron {
    if (!address) {
      return '' as AddressTron;
    }
    try {
      if (AddressUtils.isTronAddress(address)) {
        return address as AddressTron;
      }
      return tron.utils.address.fromHex(
        AddressUtils.toEth(address),
      ) as AddressTron;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toTron', {address});
      return address as AddressTron;
    }
  }

  static toHaqq(address: string): AddressCosmos {
    if (!address) {
      return '' as AddressCosmos;
    }
    try {
      if (AddressUtils.isTronAddress(address)) {
        return AddressUtils.toHaqq(
          tron.utils.address
            .toChecksumAddress(address)
            .replace(tron.utils.address.ADDRESS_PREFIX_REGEX, '0x'),
        );
      }
      if (AddressUtils.isHaqqAddress(address)) {
        return address.toLowerCase() as AddressCosmos;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return address.toLowerCase() as AddressCosmos;
      }
      return converter('haqq').toBech32(address).toLowerCase() as AddressCosmos;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toHaqq', {address});
      return address as AddressCosmos;
    }
  }

  static toEth(address: string): AddressEthereum {
    if (!address) {
      return '' as AddressEthereum;
    }
    try {
      if (AddressUtils.isTronAddress(address)) {
        return tron.utils.address
          .toChecksumAddress(address)
          .replace(
            tron.utils.address.ADDRESS_PREFIX_REGEX,
            '0x',
          ) as AddressEthereum;
      }
      if (AddressUtils.isEthAddress(address)) {
        return address.toLowerCase() as AddressEthereum;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return address.toLowerCase() as AddressEthereum;
      }
      return converter('haqq').toHex(address).toLowerCase() as AddressEthereum;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toEth', {address});
      return address as AddressEthereum;
    }
  }

  static isTronAddress(address: string): address is AddressTron {
    if (!address) {
      return false;
    }
    try {
      return tron.utils.address.isAddress(address);
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isTronAddress', {address});
      return false;
    }
  }

  static isEthAddress(address: string): address is AddressEthereum {
    if (!address) {
      return false;
    }
    try {
      return utils.isAddress(address);
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isEthAddress', {address});
      return false;
    }
  }

  static isHaqqValidatorAddress = (address: string): boolean =>
    typeof address === 'string' && address.startsWith(HAQQ_VALIDATOR_PREFIX);

  static isHaqqAddress = (address: string): address is AddressCosmos => {
    if (
      !address ||
      typeof address !== 'string' ||
      !address.startsWith('haqq')
    ) {
      return false;
    }
    try {
      if (AddressUtils.isHaqqValidatorAddress(address)) {
        return true;
      }
      const hex = converter('haqq').toHex(address);
      return AddressUtils.isEthAddress(hex);
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isHaqqAddress', {address});
      return false;
    }
  };

  static isValidAddress = (address: string): boolean =>
    AddressUtils.isEthAddress(address) || AddressUtils.isHaqqAddress(address);

  static isContractAddress = async (address: string): Promise<boolean> => {
    if (!address) {
      return false;
    }
    try {
      const response = await Whitelist.verifyAddress(address);
      return response?.address_type === AddressType.contract;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.isContractAddress', {address});
      return false;
    }
  };

  static equals = (a: string, b: string): boolean =>
    AddressUtils.toEth(a) === AddressUtils.toEth(b);

  static splitAddress = splitAddress;
}

export const NATIVE_TOKEN_ADDRESS = AddressUtils.toEth(
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
);
