import converter from 'bech32-converting';
import {utils} from 'ethers';
import tron from 'tronweb';

import {Wallet} from '@app/models/wallet';
import {Whitelist} from '@app/models/whitelist';
import {NetworkProviderTypes} from '@app/services/backend';
import {
  AddressCosmosHaqq,
  AddressEthereum,
  AddressTron,
  AddressType,
} from '@app/types';
import {splitAddress} from '@app/utils';

export const HAQQ_VALIDATOR_PREFIX = 'haqqvaloper';
export class AddressUtils {
  static hexToTron(address?: string): AddressTron {
    if (!address) {
      return '' as AddressTron;
    }
    if (tron.utils.address.isAddress(address)) {
      return address as AddressTron;
    }
    if (address.startsWith('haqq')) {
      return AddressUtils.haqqToTron(address);
    }
    return tron.utils.address.fromHex(address) as AddressTron;
  }

  static tronToHex(address?: string): AddressEthereum {
    if (!address) {
      return '' as AddressEthereum;
    }

    if (address.startsWith('0x')) {
      return address as AddressEthereum;
    }

    return tron.utils.address
      .toChecksumAddress(address)
      .replace(tron.utils.address.ADDRESS_PREFIX_REGEX, '0x')
      .toLowerCase() as AddressEthereum;
  }

  static haqqToTron(address?: string): AddressTron {
    if (!address) {
      return '' as AddressTron;
    }

    return AddressUtils.hexToTron(
      converter('haqq').toHex(address).toLowerCase(),
    );
  }

  static tronToHaqq(address?: string): AddressCosmosHaqq {
    if (!address) {
      return '' as AddressCosmosHaqq;
    }

    if (address.startsWith('haqq')) {
      return address as AddressCosmosHaqq;
    }

    return converter('haqq')
      .toBech32(AddressUtils.tronToHex(address))
      .toLowerCase() as AddressCosmosHaqq;
  }

  static toTron(address?: string): AddressTron {
    if (!address) {
      return '' as AddressTron;
    }

    try {
      if (AddressUtils.isTronAddress(address)) {
        return address as AddressTron;
      }

      // we should use tronAddress for existings wallet addres from Wallet store
      // because this wallet use tron address for different HD path
      const wallet = AddressUtils.getWalletByAddress(address);
      if (wallet) {
        return wallet.tronAddress;
      }

      return tron.utils.address.fromHex(
        AddressUtils.toEth(address),
      ) as AddressTron;
    } catch (e) {
      Logger.warn(e, 'AddressUtils.toTron', {address});
      return address as AddressTron;
    }
  }

  static toHaqq(address: string): AddressCosmosHaqq {
    if (!address) {
      return '' as AddressCosmosHaqq;
    }
    try {
      if (AddressUtils.isTronAddress(address)) {
        const isExistWallet = Wallet.getAll().find(
          w => w.tronAddress === address,
        );
        if (isExistWallet) {
          return isExistWallet.cosmosAddress;
        }
        return AddressUtils.toHaqq(
          tron.utils.address
            .toChecksumAddress(address)
            .replace(tron.utils.address.ADDRESS_PREFIX_REGEX, '0x'),
        );
      }
      if (AddressUtils.isHaqqAddress(address)) {
        return address.toLowerCase() as AddressCosmosHaqq;
      }
      if (AddressUtils.isHaqqValidatorAddress(address)) {
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

  static toEth(address: string): AddressEthereum {
    if (!address) {
      return '' as AddressEthereum;
    }
    try {
      if (AddressUtils.isTronAddress(address)) {
        const isExistWallet = Wallet.getAll().find(
          w => w.tronAddress === address,
        );
        if (isExistWallet) {
          return isExistWallet.address;
        }
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

  static isTronAddress(address?: string): address is AddressTron {
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

  static isHaqqAddress = (address: string): address is AddressCosmosHaqq => {
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
    AddressUtils.isEthAddress(address) ||
    AddressUtils.isHaqqAddress(address) ||
    AddressUtils.isTronAddress(address);

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

  static equals = (a: string, b: string): boolean => {
    if (AddressUtils.isTronAddress(a) || AddressUtils.isTronAddress(b)) {
      return AddressUtils.toTron(a) === AddressUtils.toTron(b);
    }

    return AddressUtils.toEth(a) === AddressUtils.toEth(b);
  };

  static splitAddress = splitAddress;

  static getConverterByNetwork(network: NetworkProviderTypes) {
    switch (network) {
      case NetworkProviderTypes.EVM:
        return AddressUtils.toEth;
      case NetworkProviderTypes.TRON:
        return AddressUtils.toTron;
      case NetworkProviderTypes.HAQQ:
      default:
        return AddressUtils.toHaqq;
    }
  }

  static convertAddressByNetwork(
    addresses: string[],
    network: NetworkProviderTypes,
  ) {
    const converterFn = AddressUtils.getConverterByNetwork(network);
    return addresses.map(address => {
      if (
        network === NetworkProviderTypes.TRON &&
        AddressUtils.isTronAddress(address)
      ) {
        return address;
      }
      return converterFn(address);
    });
  }

  static getWalletByAddress(address: string) {
    const addressLower = address.toLowerCase();

    return Wallet.getAll().find(w => {
      if (address.startsWith('0x')) {
        const trxAddress = AddressUtils.hexToTron(address);
        return (
          addressLower === w.address.toLowerCase() ||
          trxAddress === w.tronAddress
        );
      }
      if (address.startsWith('haqq')) {
        const trxAddress = AddressUtils.haqqToTron(address);
        return (
          addressLower === w.cosmosAddress.toLowerCase() ||
          trxAddress === w.tronAddress
        );
      }
      if (AddressUtils.isTronAddress(address)) {
        return w.tronAddress === address;
      }
    });
  }
}

export const NATIVE_TOKEN_ADDRESS = AddressUtils.toEth(
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
);
