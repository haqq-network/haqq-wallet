import {Color} from '@app/colors';
import {Icon, IconsName, TextField} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {TransactionNetworkSelectSearchProps} from './transaction-network-select.types';

export const TransactionNetworkSelectSearch = ({
  value,
  onChange,
}: TransactionNetworkSelectSearchProps) => {
  return (
    <TextField
      label={I18N.browserSearch}
      value={value}
      onChangeText={onChange}
      leading={<Icon i24 name={IconsName.search} color={Color.graphicBase2} />}
      style={styles.searchField}
    />
  );
};

const styles = createTheme({
  searchField: {marginBottom: 16},
});
