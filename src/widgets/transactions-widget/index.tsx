import React, {memo} from 'react';

import {TransactionsWidget} from '@app/widgets/transactions-widget/transactions-widget';

const TransactionsWidgetWrapper = memo(() => {
  // const lastThreeTransactions = prepareTransactions(
  //   Wallet.addressList(),
  //   Transaction.getAll().snapshot(),
  // );
  return <TransactionsWidget onPress={() => {}} />;
});

export {TransactionsWidgetWrapper};
