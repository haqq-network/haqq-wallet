import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconsName,
  Inline,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme, getWindowWidth} from '@app/helpers';
import {I18N} from '@app/i18n';
import {MAGIC_CARD_HEIGHT} from '@app/variables/common';
import {SHADOW_L} from '@app/variables/shadows';

export type BalanceProps = {
  testID?: string;
  onPressCreate: () => void;
  onPressHardwareWallet: () => void;
  onPressRestore: () => void;
};
export const WalletCreate = ({
  testID,
  onPressCreate,
  onPressHardwareWallet,
  onPressRestore,
}: BalanceProps) => {
  return (
    <View style={styles.container} testID={testID}>
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
        onPress={onPressCreate}
        style={styles.create}
        testID={`${testID}_create`}
      />
      <Inline gap={0}>
        <Button
          variant={ButtonVariant.second}
          size={ButtonSize.middle}
          onPress={onPressHardwareWallet}
          testID={`${testID}_hardware`}>
          <View style={styles.createButtonChildren}>
            <Text t9 i18n={I18N.walletCreateConnect} color={Color.textGreen1} />
            <Spacer width={8} />
            <Icon i22 name={IconsName.keystone} color={Color.graphicGreen1} />
            <Spacer width={8} />
            <Icon i22 name={IconsName.ledger} color={Color.graphicGreen1} />
          </View>
        </Button>
        <Button
          size={ButtonSize.middle}
          i18n={I18N.walletCreateImport}
          onPress={onPressRestore}
          testID={`${testID}_import`}
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
    width: () => getWindowWidth() - 40,
    height: () => Math.max((getWindowWidth() - 40) * MAGIC_CARD_HEIGHT, 212),
    ...SHADOW_L,
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
  createButtonChildren: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
