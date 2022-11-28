import React, {useCallback, useEffect, useRef} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {useApp, useTypedNavigation, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Cosmos} from '@app/services/cosmos';

export const HomeStakingScreen = () => {
  const app = useApp();
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const wallets = useWallets();
  const navigation = useTypedNavigation();

  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  const onPressGetRewards = useCallback(() => {
    app.emit('notification', getText(I18N.notificationRewardReceived));
  }, [app]);

  useEffect(() => {
    const addressList = wallets.visible.map(w => w.cosmosAddress);

    cosmos.sync(addressList);
  }, [cosmos, wallets.visible]);

  return (
    <HomeStaking
      onPressGetRewards={onPressGetRewards}
      onPressValidators={onPressValidators}
    />
  );
};
