import {SectionListData, SectionListRenderItemInfo} from 'react-native';

import {Transaction} from '@app/models/transaction';

export type TransactionSection = SectionListData<
  Transaction,
  {
    timestamp: string;
    data: Transaction[];
  }
>;

export type ItemData = SectionListRenderItemInfo<
  Transaction,
  TransactionSection
>;

export type SectionHeaderData = {
  section: SectionListData<Transaction, TransactionSection>;
};
