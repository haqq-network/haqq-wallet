import {Color} from '@app/colors';
import {Icon, IconsName, TextField} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type SearchInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput = ({
  label = I18N.browserSearch,
  value,
  onChange,
}: SearchInputProps) => {
  return (
    <TextField
      label={label}
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
