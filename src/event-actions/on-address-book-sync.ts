import {BigNumber} from '@ethersproject/bignumber';

import {AddressBook} from '@app/models/address-book';
import {Provider} from '@app/models/provider';
import {EthNetwork} from '@app/services';

export async function onAddressBookSync(id: string) {
  try {
    const addressBook = AddressBook.getById(id);

    if (!addressBook) {
      throw new Error('AddressBook not found');
    }

    const provider = Provider.getByChainId(addressBook.chainId);

    if (!provider) {
      throw new Error('Provider not found');
    }
    const network = new EthNetwork(provider.rpcProvider);
    const nftCollection = require('@assets/abi/nft-collection.json');

    const [tokens] = await network.callContract(
      nftCollection,
      addressBook.address,
      'tokensOfOwner',
    );

    console.log('tokens', tokens);

    addressBook.update({
      tokens: tokens.map((t: any) => BigNumber.from(t).toString()),
    });
  } catch (e) {
    console.log('onAddressBookSync', e)
  }
}
