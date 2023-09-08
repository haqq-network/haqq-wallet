import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type LedgerAccountsFooterProps = {
  count: number;
  loading: boolean;
  loadMore: () => void;
  onAdd: () => void;
};
export const ChooseAccountFooter = ({
  loadMore,
  loading,
  count,
  onAdd,
}: LedgerAccountsFooterProps) => {
  return (
    <View style={styles.container}>
      <Text
        t15
        i18n={I18N.chooseAccountLoadInfo}
        color={Color.textBase2}
        center
      />
      <Spacer height={10} />
      <Button
        onPress={loadMore}
        loading={loading}
        i18n={I18N.ledgerAccountsLoadMore}
        variant={ButtonVariant.second}
        size={ButtonSize.middle}
      />
      {count > 0 && (
        <>
          <Spacer height={10} />
          <Button
            onPress={onAdd}
            i18n={
              count > 1
                ? I18N.chooseAccountAddManyAccountsText
                : I18N.chooseAccountAddOneAccountText
            }
            i18params={{value: String(count)}}
            variant={ButtonVariant.contained}
            size={ButtonSize.middle}
          />
        </>
      )}
    </View>
  );
};

const styles = createTheme({
  container: {
    padding: 20,
  },
});
