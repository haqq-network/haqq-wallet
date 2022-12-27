import React from 'react';

import {View} from 'react-native';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  DataContent,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {LedgerAccountItem} from '@app/types';
import {cleanNumber, shortAddress} from '@app/utils';

export type LedgerAccountsRowProps = {
  item: LedgerAccountItem;
  onPress: (item: LedgerAccountItem) => void;
};

export const LedgerAccountsRow = ({item, onPress}: LedgerAccountsRowProps) => {
  const onPressButton = () => {
    onPress(item);
  };

  return (
    <View style={styles.container}>
      <DataContent
        title={`${cleanNumber(item.balance)} ISML`}
        subtitle={shortAddress(item.address)}
      />
      {item.exists ? (
        <Button
          disabled
          variant={ButtonVariant.second}
          size={ButtonSize.small}
          i18n={I18N.ledgerAccountsAdded}
          onPress={onPressButton}
        />
      ) : (
        <Button
          variant={ButtonVariant.second}
          size={ButtonSize.small}
          i18n={I18N.ledgerAccountsAdd}
          onPress={onPressButton}
        />
      )}
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
