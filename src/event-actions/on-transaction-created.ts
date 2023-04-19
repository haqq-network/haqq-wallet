import {captureException} from '@app/helpers';
import {AddressBook, AddressBookType} from '@app/models/address-book';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';

const types = {
  isERC165: 0x01ffc9a7,
  isERC721: 0x80ac58cd,
  isERC721Metadata: 0x5b5e139f,
  isERC721TokenReceiver: 0x150b7a02,
  isERC721Enumerable: 0x780e9d63,
  isAccessControl: 0x7965db0b,
};

export async function onTransactionCreated(hash: string) {
  const transaction = Transaction.getById(hash);
  if (!transaction) {
    return;
  }

  const provider = Provider.getProvider(transaction.providerId);
  if (!provider) {
    return;
  }

  if (transaction && !transaction.confirmed) {
    try {
      const receipt = await provider.rpcProvider.getTransactionReceipt(
        transaction.hash,
      );
      if (receipt && receipt.confirmations > 0) {
        transaction.setConfirmed(receipt);
      }
    } catch (e) {
      captureException(e, 'checkTransaction');
    }
  }

  if (transaction.to) {
    const checked = AddressBook.getByAddressAndChainId(
      transaction.to.toLowerCase(),
      String(provider.ethChainId),
    );

    if (!checked) {
      const id = AddressBook.create(
        transaction.to.toLowerCase(),
        String(provider.ethChainId),
        {},
      );

      const hasCode = await EthNetwork.network.getCode(transaction.to);
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

      const supportsInterface = require('@assets/abi/support-interface.json');

      if (hasCode && hasCode !== '0x') {
        const isERC721 = await EthNetwork.callContract(
          supportsInterface,
          transaction.to,
          'supportsInterface',
          types.isERC721,
        );

        upd.isERC721 = isERC721[0];

        if (upd.isERC721) {
          const erc721 = require('@assets/abi/erc721.json');

          const name = await EthNetwork.callContract(
            erc721,
            transaction.to,
            'name',
          );

          upd.name = name[0];

          const symbol = await EthNetwork.callContract(
            erc721,
            transaction.to,
            'symbol',
          );

          upd.symbol = symbol[0];
        }
      }

      const addressBook = AddressBook.getById(id);
      addressBook?.update(upd);
    }
  }
}
