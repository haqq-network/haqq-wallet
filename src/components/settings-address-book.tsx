import React from 'react';

import {Color, getColor} from '@app/colors';
import {AddressEmpty} from '@app/components/address-empty';
import {AddressHeader} from '@app/components/address-header';
import {ListContact} from '@app/components/list-contact';
import {Box, Icon, IconButton, Text, TextField} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {withActionsContactItem} from '@app/hocs';
import {I18N, getText} from '@app/i18n';

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
              <Icon name="qr_scanner" color={Color.graphicGreen1} />
            </IconButton>
          ) : (
            <IconButton onPress={onPressClear}>
              <Icon name="close_circle" color={getColor(Color.graphicBase2)} />
            </IconButton>
          )
        }
      />

      {canAdd && (
        <IconButton onPress={onPressAdd} style={styles.addButton}>
          <Box style={styles.badge}>
            <Icon name="plus_mid" color={getColor(Color.graphicBase2)} />
          </Box>
          <Text
            color={getColor(Color.textBase2)}
            i18n={I18N.settingsAddressBookAdd}
          />
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
