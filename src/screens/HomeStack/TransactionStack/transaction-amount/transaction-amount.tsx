import React, {useCallback, useEffect} from 'react';

import {observer} from 'mobx-react';

import {useTypedNavigation} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';

import {TransactionAmountCrossChain} from './transaction-amount-cross-chain';
import {TransactionAmountRightHeaderOptions} from './transaction-amount-right-header-options';
import {TransactionAmountSingleChain} from './transaction-amount-single-chain';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {isCrossChain} = TransactionStore;

  const onPreviewPress = useCallback(() => {
    navigation.navigate(TransactionStackRoutes.TransactionPreview);
  }, []);

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: props => <TransactionAmountRightHeaderOptions {...props} />,
    });
  }, []);

  if (isCrossChain) {
    return <TransactionAmountCrossChain onPreviewPress={onPreviewPress} />;
  }

  return <TransactionAmountSingleChain onPreviewPress={onPreviewPress} />;
});
