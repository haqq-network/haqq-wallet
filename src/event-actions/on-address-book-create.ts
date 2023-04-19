import {captureException} from '@app/helpers';
import {AddressBook, AddressBookType} from '@app/models/address-book';
import {EthNetwork} from '@app/services';

export async function onAddressBookCreate(address: string, ethChainId: string) {
  const addressBook = AddressBook.getByAddressAndChainId(address, ethChainId);

  if (addressBook) {
    return;
  }

  const hasCode = await EthNetwork.network.getCode(address);
  const upd = {
    type:
      hasCode && hasCode !== '0x'
        ? AddressBookType.contract
        : AddressBookType.address,
    isERC165: false,
    isERC721: false,
    isERC721Metadata: false,
    isERC721TokenReceiver: false,
    isERC721Enumerable: false,
    isAccessControl: false,
    name: '',
    symbol: '',
  };
  try {
    if (hasCode && hasCode !== '0x') {
      const supportsInterface = require('@assets/abi/support-interface.json');

      const isERC721 = await EthNetwork.callContract(
        supportsInterface,
        address,
        'supportsInterface',
        AddressBook.types.isERC721,
      );

      upd.isERC721 = isERC721[0];

      if (upd.isERC721) {
        const erc721 = require('@assets/abi/erc721.json');

        const name = await EthNetwork.callContract(erc721, address, 'name');

        upd.name = name[0];

        const symbol = await EthNetwork.callContract(erc721, address, 'symbol');

        upd.symbol = symbol[0];
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      captureException(e, 'onAddressBookCreate');
    }
  }
  AddressBook.create(address.toLowerCase(), String(ethChainId), upd);

  return;
}
