import React, {memo, useCallback} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {TransactionsWidget} from '@app/widgets/transactions-widget/transactions-widget';

const TransactionsWidgetWrapper = memo(() => {
  const navigation = useTypedNavigation();

  const openTotalInfo = useCallback(() => {
    navigation.navigate('totalValueInfo');
  }, [navigation]);

  return <TransactionsWidget onPress={openTotalInfo} />;
});

export {TransactionsWidgetWrapper};
