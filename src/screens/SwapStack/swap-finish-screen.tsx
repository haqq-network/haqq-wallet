import React, {useCallback, useEffect, useMemo} from 'react';

import {observer} from 'mobx-react';

import {SwapFinish} from '@app/components/swap';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useOpenInAppBrowser} from '@app/hooks/use-open-in-app-browser';
import {Provider} from '@app/models/provider';
import {SwapStackParamList, SwapStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ZERO_HEX_NUMBER} from '@app/variables/common';

export const SwapFinishScreen = observer(({}) => {
  const {openInAppBrowser} = useOpenInAppBrowser();

  const navigation = useTypedNavigation<SwapStackParamList>();
  const {
    estimateData,
    token0,
    token1,
    txHash,
    isUnwrapTx,
    isWrapTx,
    rate,
    amountIn,
    amountOut,
  } = useTypedRoute<SwapStackParamList, SwapStackRoutes.Finish>().params;

  const providerFee = useMemo(() => {
    const symbol = token0?.symbol!;
    const decimals = token0?.decimals!;
    if (!estimateData?.fee) {
      return new Balance(ZERO_HEX_NUMBER, decimals, symbol);
    }
    return new Balance(estimateData?.fee.amount || '0', decimals, symbol);
  }, [token0, estimateData]);

  const handlePressDone = useCallback(async () => {
    await awaitForEventDone(Events.onAppReviewRequest);
    navigation.goBack();
  }, [navigation]);

  const handlePressHash = useCallback(() => {
    openInAppBrowser(Provider.selectedProvider.getTxExplorerUrl(txHash));
  }, [txHash, openInAppBrowser]);

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  return (
    <SwapFinish
      amountIn={amountIn}
      amountOut={amountOut}
      onPressDone={handlePressDone}
      onPressHash={handlePressHash}
      testID="swap_finish"
      estimateData={estimateData}
      token0={token0}
      token1={token1}
      isUnwrapTx={isUnwrapTx}
      isWrapTx={isWrapTx}
      rate={rate}
      providerFee={providerFee}
    />
  );
});
