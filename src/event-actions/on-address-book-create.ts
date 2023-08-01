import {AddressBook, AddressBookType} from '@app/models/address-book';
import {EthNetwork} from '@app/services';

export async function onAddressBookCreate(address: string, ethChainId: number) {
  try {
    const addressBook = AddressBook.getByAddressAndChainId(
      address,
      String(ethChainId),
    );

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

    AddressBook.create(address.toLowerCase(), String(ethChainId), upd);
  } catch (e) {
    Logger.captureException(e, 'onAddressBookCreate');
  }
}
