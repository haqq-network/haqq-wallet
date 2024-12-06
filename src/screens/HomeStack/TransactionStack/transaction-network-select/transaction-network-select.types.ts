import {ProviderModel} from '@app/models/provider';

export type TransactionNetworkSelectSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export type TransactionNetworkSelectItemProps = {
  item: ProviderModel;
};
