import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonProps, ButtonVariant} from '@app/components/ui/button';
import {Icon, IconsName} from '@app/components/ui/icon';
import {Spacer} from '@app/components/ui/spacer';
import {Text, TextVariant} from '@app/components/ui/text';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

type Props = Pick<
  ButtonProps,
  'size' | 'disabled' | 'style' | 'testID' | 'onPress'
>;

export const HardwareWalletButton = (props: Props) => {
  if (Provider.selectedProvider.isTron) {
    return null;
  }

  return (
    <Button {...props} variant={ButtonVariant.second}>
      <View style={styles.row}>
        <Text
          variant={TextVariant.t9}
          color={Color.textGreen1}
          i18n={I18N.welcomeConnectHardwareWallet}
        />
        <Spacer width={8} />
        <Icon color={Color.textGreen1} name={IconsName.ledger} i22 />
        <Spacer width={8} />
        <Icon color={Color.textGreen1} name={IconsName.keystone} i22 />
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row'},
});
