import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {awaitForWallet, createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/route-types';

export const SwapWidget = observer(() => {
  const navigation = useTypedNavigation();

  const onPress = useCallback(async () => {
    const address = await awaitForWallet({
      wallets: Wallet.getAll(),
      title: I18N.selectAccount,
    });
    navigation.navigate(HomeStackRoutes.Swap, {address});
  }, [navigation]);

  return (
    <ShadowCard style={styles.wrapper} onPress={onPress}>
      <View style={styles.image}>
        <Image source={require('@assets/images/swap-tokens.png')} />
      </View>
      <Spacer width={10} />
      <View style={styles.textWrapper}>
        <WidgetHeader title={getText(I18N.swapWidgetTitle)} />
        <Text
          color={Color.textBase2}
          variant={TextVariant.t11}
          i18n={I18N.swapWidgetDescription}
        />
      </View>
    </ShadowCard>
  );
});

const styles = createTheme({
  image: {
    width: 62,
    height: 62,
  },
  textWrapper: {
    justifyContent: 'flex-start',
    flex: 1,
  },
  wrapper: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flex: 1,
  },
});
