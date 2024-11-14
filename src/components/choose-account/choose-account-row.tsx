import React, {useCallback, useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  DataContent,
  First,
  Icon,
  IconsName,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {ChooseAccountItem} from '@app/types';

export type LedgerAccountsRowProps = {
  index: number;
  item: ChooseAccountItem;
  onPress: (item: ChooseAccountItem) => void;
};

export const ChooseAccountRow = ({
  item,
  onPress,
  index,
}: LedgerAccountsRowProps) => {
  const onPressButton = useCallback(() => {
    onPress(item);
  }, [onPress, item]);
  const isWalletCreated = useMemo(() => !!Wallet.getById(item.address), [item]);

  const address = useMemo(() => {
    if (isWalletCreated) {
      const w = Wallet.getById(item.address)!;
      return Provider.selectedProvider.isTron ? w.tronAddress : w.address;
    }

    if (Provider.selectedProvider.isTron) {
      return item.tronAddress || AddressUtils.toTron(item.address);
    }
    return item.address;
  }, [item, isWalletCreated]);

  return (
    <View style={styles.container}>
      <View style={styles.index}>
        {(!!item.exists || isWalletCreated) && (
          <Icon
            i16
            name={IconsName.check}
            color={Color.graphicGreen1}
            style={styles.icon}
          />
        )}
        <Text t15 color={Color.textBase2}>
          {index}
        </Text>
      </View>
      <DataContent
        title={item.balance.toBalanceString()}
        subtitle={shortAddress(address as string)}
        style={item.exists ? styles.selectedButton : {}}
      />
      <Spacer />
      <First>
        {isWalletCreated && (
          <Button
            disabled
            variant={ButtonVariant.second}
            size={ButtonSize.small}
            i18n={I18N.cancel}
          />
        )}

        {item.exists && (
          <Button
            variant={ButtonVariant.warning}
            size={ButtonSize.small}
            i18n={I18N.cancel}
            onPress={onPressButton}
            testID={`wallet_remove_${index}`}
          />
        )}

        <Button
          variant={ButtonVariant.second}
          size={ButtonSize.small}
          i18n={I18N.ledgerAccountsAdd}
          onPress={onPressButton}
          testID={`wallet_add_${index}`}
        />
      </First>
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  index: {
    minWidth: 22,
    marginRight: 12,
    height: 22,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginVertical: 18,
    flexDirection: 'row',
  },
  icon: {
    marginRight: 4,
  },
  selectedButton: {
    marginLeft: 12,
  },
});
