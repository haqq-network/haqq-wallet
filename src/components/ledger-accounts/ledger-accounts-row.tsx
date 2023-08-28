import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  DataContent,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {LedgerAccountItem} from '@app/types';

export type LedgerAccountsRowProps = {
  index: number;
  item: LedgerAccountItem;
  onPress: (item: LedgerAccountItem) => void;
};

export const LedgerAccountsRow = ({
  item,
  onPress,
  index,
}: LedgerAccountsRowProps) => {
  const onPressButton = () => {
    onPress(item);
  };

  return (
    <View style={styles.container}>
      <View style={styles.index}>
        <Text t15 color={Color.textBase2}>
          {index}
        </Text>
      </View>
      <DataContent
        title={`${cleanNumber(item.balance)} ISLM`}
        subtitle={shortAddress(item?.address)}
      />
      <Spacer />
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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  index: {
    minWidth: 22,
    marginRight: 12,
    height: 22,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginVertical: 16,
  },
});
