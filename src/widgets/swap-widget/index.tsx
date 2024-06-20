import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {app} from '@app/contexts';
import {awaitForWallet, createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/route-types';

export const SwapWidget = observer(() => {
  const navigation = useTypedNavigation();

  const onPress = useCallback(async () => {
    const wallets = Wallet.getAll();
    const walletsWithBalances = wallets.filter(wallet => {
      if (wallet.isHidden) {
        return false;
      }
      const balance = app.getAvailableBalance(wallet.address);
      const isPositiveBalance = balance.isPositive();

      const tokens = Token.tokens[wallet.address] || [];
      const isPositiveTokenBalance = tokens.some(
        token => token.value?.isPositive?.(),
      );

      return isPositiveBalance || isPositiveTokenBalance;
    });

    const address = await awaitForWallet({
      wallets: walletsWithBalances?.length ? walletsWithBalances : wallets,
      title: I18N.selectAccount,
    });
    navigation.navigate(HomeStackRoutes.Swap, {address});
  }, [navigation]);

  return (
    <ShadowCard style={styles.wrapper} onPress={onPress}>
      <Image
        style={styles.image}
        source={require('@assets/images/swap-tokens.png')}
      />
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
