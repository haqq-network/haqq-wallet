import React, {useCallback, useEffect, useRef, useState} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedNavigation, useWallets} from '@app/hooks';
import {Cosmos} from '@app/services/cosmos';

export const HomeStakingScreen = () => {
  const [loading, setLoading] = useState(true);
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const wallets = useWallets();
  const navigation = useTypedNavigation();
  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  useEffect(() => {
    const addressList = wallets.visible.map(w => w.transport.cosmosAddress);

    cosmos.sync(addressList).then(() => {
      setLoading(false);
    });
  }, [cosmos, wallets.visible]);

  if (loading) {
    return <Loading />;
  }

  return <HomeStaking onPressValidators={onPressValidators} />;
};
