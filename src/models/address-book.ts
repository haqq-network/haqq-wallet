import {realm} from '@app/models';

export enum AddressBookType {
  address = 'address',
  contract = 'contract',
  unknown = 'unknown',
}

export class AddressBook extends Realm.Object {
  static types = {
    isERC165: 0x01ffc9a7,
    isERC721: 0x80ac58cd,
    isERC721Metadata: 0x5b5e139f,
    isERC721TokenReceiver: 0x150b7a02,
    isERC721Enumerable: 0x780e9d63,
    isAccessControl: 0x7965db0b,
  };

  static schema = {
    name: 'AddressBook',
    properties: {
      id: 'string',
      address: 'string',
      chainId: 'string',
      type: {type: 'string', default: AddressBookType.unknown},
      isERC165: {type: 'bool', default: false},
      isERC721: {type: 'bool', default: false},
      isERC721Metadata: {type: 'bool', default: false},
      isERC721TokenReceiver: {type: 'bool', default: false},
      isERC721Enumerable: {type: 'bool', default: false},
      isAccessControl: {type: 'bool', default: false},
      isWhiteList: {type: 'bool', default: false},
      name: 'string?',
      symbol: 'string?',
      tokens: 'string[]',
    },
    primaryKey: 'id',
  };
  id!: string;
  address!: string;
  chainId!: string;
  type: AddressBookType;
  isERC165: boolean;
  isERC721: boolean;
  isERC721Metadata: boolean;
  isERC721TokenReceiver: boolean;
  isERC721Enumerable: boolean;
  isAccessControl: boolean;
  isWhiteList: boolean;
  tokens: string[];

  static create(
    address: string,
    chainId: string,
    params: Omit<Partial<AddressBook>, 'address' | 'chainId' | 'id'> = {},
  ) {
    const id = `${address.toLowerCase()}-${chainId}`;
    const exists = AddressBook.getById(id);
    realm.write(() => {
      realm.create<AddressBook>(
        AddressBook.schema.name,
        {
          ...(exists ?? {}),
          ...params,
          address: address.toLowerCase(),
          chainId,
          id,
        },
        Realm.UpdateMode.Modified,
      );
    });

    return id;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<AddressBook>(
      AddressBook.schema.name,
      id,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getAll() {
    return realm.objects<AddressBook>(AddressBook.schema.name);
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<AddressBook>(
      AddressBook.schema.name,
      id.toLowerCase(),
    );
  }

  static getByAddressAndChainId(address: string, chainId: string) {
    return AddressBook.getById(`${address.toLowerCase()}-${chainId}`);
  }

  static removeAll() {
    const contacts = realm.objects<AddressBook>(AddressBook.schema.name);

    for (const contact of contacts) {
      realm.write(() => {
        realm.delete(contact);
      });
    }
  }

  update(params: Omit<Partial<AddressBook>, 'id' | 'address' | 'chainId'>) {
    realm.write(() => {
      realm.create(
        AddressBook.schema.name,
        {
          ...this.toJSON(),
          ...params,
          address: this.address,
          chainId: this.chainId,
          id: `${this.address.toLowerCase()}-${this.chainId}`,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
