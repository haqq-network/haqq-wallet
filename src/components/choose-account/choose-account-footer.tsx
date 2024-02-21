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

type ChooseAccountFooterProps = {
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
}: ChooseAccountFooterProps) => {
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
        testID={`load_more${loading ? '_loading' : ''}`}
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
            loading={loading}
            testID={
              loading ? 'choose_account_loading_next' : 'choose_account_next'
            }
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
