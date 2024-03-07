import React from 'react';

import {View} from 'react-native';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';

export type LedgerAccountsFooterProps = {
  count: number;
  loading: boolean;
  loadMore: () => void;
};
export const LedgerAccountsFooter = ({
  loadMore,
  loading,
  count,
}: LedgerAccountsFooterProps) => {
  if (!count) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text t15 i18n={I18N.ledgerAccountsLoadInfo} color={Color.textBase2} />
      <Spacer height={10} />
      <Button
        onPress={loadMore}
        loading={loading}
        i18n={I18N.ledgerAccountsLoadMore}
        variant={ButtonVariant.second}
        size={ButtonSize.middle}
      />
    </View>
  );
};

const styles = createTheme({
  container: {
    padding: 20,
  },
});
