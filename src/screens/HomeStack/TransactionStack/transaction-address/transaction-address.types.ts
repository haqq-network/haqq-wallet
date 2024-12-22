import {WalletModel} from '@app/models/wallet';

export type TransactionAddressInputProps = {
  isError: boolean;
  setIsError: (isError: boolean) => void;

  onDone: (address: string) => Promise<void>;

  testID: string;
};

export type TransactionAddressWalletListProps = {
  onPress: (wallet: WalletModel) => void;
};

export type TransactionAddressContactListProps = {
  onPress: (address: string) => void;
};

export type TransactionAddressAddContactProps = {
  address: string;
};
