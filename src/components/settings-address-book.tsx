import React from 'react';

import {AddressEmpty} from '@app/components/address-empty';
import {AddressHeader} from '@app/components/address-header';
import {ListContact} from '@app/components/list-contact';
import {
  Box,
  Icon,
  IconButton,
  QRScanner,
  Text,
  TextField,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {withActionsContactItem} from '@app/hocs';
import {I18N, getText} from '@app/i18n';
import {
  LIGHT_GRAPHIC_BASE_2,
  LIGHT_GRAPHIC_GREEN_1,
  LIGHT_TEXT_BASE_1,
} from '@app/variables';

const ListOfContacts = withActionsContactItem(ListContact, {
  nextScreen: 'settingsContactEdit',
});

type SettingsAddressBookProps = {
  onPressAddress: () => void;
  onPressAdd: () => void;
  onPressClear: () => void;
  onPressQR: () => void;
  setSearch: (value: string) => void;
  canAdd: boolean;
  search: string;
};

export const SettingsAddressBook = ({
  onPressAddress,
  onPressAdd,
  onPressClear,
  onPressQR,
  canAdd,
  search,
  setSearch,
}: SettingsAddressBookProps) => {
  return (
    <>
      <TextField
        label={getText(I18N.settingsAddressBookLabel)}
        style={styles.input}
        placeholder={getText(I18N.settingsAddressBookPlaceholder)}
        value={search}
        onChangeText={setSearch}
        multiline
        autoFocus
        rightAction={
          search === '' ? (
            <IconButton onPress={onPressQR}>
              <QRScanner color={LIGHT_GRAPHIC_GREEN_1} style={styles.icon} />
            </IconButton>
          ) : (
            <IconButton onPress={onPressClear}>
              <Icon i24 name="close_circle" color={LIGHT_GRAPHIC_BASE_2} />
            </IconButton>
          )
        }
      />

      {canAdd && (
        <IconButton onPress={onPressAdd} style={styles.addButton}>
          <Box style={styles.badge}>
            <Icon i24 name="plus_mid" color={LIGHT_GRAPHIC_BASE_2} />
          </Box>
          <Text color={LIGHT_TEXT_BASE_1} i18n={I18N.settingsAddressBookAdd} />
        </IconButton>
      )}
      <ListOfContacts
        ListHeaderComponent={AddressHeader}
        ListEmptyComponent={AddressEmpty}
        contentContainerStyle={styles.grow}
        onPressAddress={onPressAddress}
        filterText={search}
      />
    </>
  );
};

const styles = createTheme({
  input: {
    marginBottom: 12,
    marginHorizontal: 20,
  },
  icon: {width: 20, height: 20},
  badge: {
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  grow: {flexGrow: 1},
});
