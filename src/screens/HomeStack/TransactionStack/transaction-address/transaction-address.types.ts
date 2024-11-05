import {Contact} from '@app/models/contact';
import {WalletModel} from '@app/models/wallet';

export type TransactionAddressInputProps = {
  address: string;
  setAddress: (address: string) => void;

  isError: boolean;
  setIsError: (isError: boolean) => void;

  onDone: (address: string) => Promise<void>;

  testID: string;
};

export type TransactionAddressWalletListProps = {
  wallets: WalletModel[];
  onPress: (address: string) => void;
};

export type TransactionAddressContactListProps = {
  contacts: Contact[];
  onPress: (address: string) => void;
};

export type TransactionAddressAddContactProps = {
  address: string;
};
