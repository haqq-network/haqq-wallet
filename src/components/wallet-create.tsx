import React from 'react';

import {View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Inline,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {MAGIC_CARD_HEIGHT, SHADOW_COLOR} from '@app/variables';

export type BalanceProps = {};
export const WalletCreate = ({}: BalanceProps) => {
  const navigation = useTypedNavigation();
  const cardWidth = useWindowDimensions().width - 40;

  return (
    <View
      style={[
        styles.container,
        {
          width: cardWidth,
          height: Math.max(cardWidth * MAGIC_CARD_HEIGHT, 212),
        },
      ]}>
      <Text
        t8
        i18n={I18N.walletCreateAddAccount}
        color={Color.textGreen1}
        center
        style={styles.title}
      />
      <Text
        t14
        center
        i18n={I18N.walletCreateImportAndCreate}
        color={Color.textBase2}
      />
      <Spacer />
      <Button
        variant={ButtonVariant.contained}
        size={ButtonSize.middle}
        i18n={I18N.walletCreateNew}
        onPress={() => {
          navigation.navigate('create');
        }}
        style={styles.create}
      />
      <Inline gap={0}>
        <Button
          variant={ButtonVariant.second}
          size={ButtonSize.middle}
          i18n={I18N.walletCreateConnect}
          title="Connect"
          iconRight="ledger"
          iconRightColor={Color.graphicGreen1}
          onPress={() => {
            navigation.navigate('ledger');
          }}
        />
        <Button
          size={ButtonSize.middle}
          i18n={I18N.walletCreateImport}
          onPress={() => {
            navigation.navigate('restore');
          }}
        />
      </Inline>
    </View>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',

    borderColor: Color.graphicSecond1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: Color.bg1,
    shadowColor: SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
  },
  title: {
    marginBottom: 4,
  },
  create: {
    flex: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
    lineHeight: 22,
    marginBottom: 8,
  },
});
