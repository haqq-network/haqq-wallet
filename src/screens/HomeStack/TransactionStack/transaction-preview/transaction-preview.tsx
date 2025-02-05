import {observer} from 'mobx-react';

import {useTypedNavigation} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {TransactionStackParamList} from '@app/route-types';

import {TransactionPreviewSingleChain} from './transaction-preview-single-chain';

import {TransactionStore} from '../transaction-store';

export const TransactionPreviewScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {fromChainId, toChainId} = TransactionStore;

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  switch (fromChainId) {
    case toChainId:
    default:
      return <TransactionPreviewSingleChain />;
  }
});
