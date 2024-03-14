import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {FlatList, ListRenderItem, View} from 'react-native';

import {getText} from '@app/i18n';
import {PermissionMap} from '@app/models/browser-permission';
import {STATUS_ANSWER_MAP} from '@app/screens/browser-privacy-details-screen';
import {Color, createTheme, getColor} from '@app/theme';
import {BrowserPermissionItem, BrowserPermissionType} from '@app/types';
import {uppercaseFirtsLetter} from '@app/utils';

import {MenuNavigationButton, Spacer, Text} from './ui';

export interface BrowserPrivacyDetailsProps {
  permissions: PermissionMap;
  onPermissionPress?(type: BrowserPermissionType): void;
}

export const BrowserPrivacyDetails = observer(
  ({onPermissionPress, permissions}: BrowserPrivacyDetailsProps) => {
    const privacyKeyExtractor = useCallback(
      ({id}: BrowserPermissionItem) => id,
      [],
    );

    const renderPrivacyItem: ListRenderItem<BrowserPermissionItem> =
      useCallback(
        ({item}) => {
          if (!item) {
            return null;
          }

          const handlePress = () => onPermissionPress?.(item.type);

          return (
            <>
              <Spacer height={16} />
              <MenuNavigationButton onPress={handlePress} style={styles.item}>
                <Text t11>{uppercaseFirtsLetter(item.type)}</Text>
                <Spacer />
                <Text t11 color={Color.textBase2}>
                  {getText(STATUS_ANSWER_MAP[item.status])}
                </Text>
              </MenuNavigationButton>
            </>
          );
        },
        [onPermissionPress],
      );

    return (
      <View style={styles.container}>
        <FlatList
          data={Object.values(permissions)}
          renderItem={renderPrivacyItem}
          keyExtractor={privacyKeyExtractor}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        />
      </View>
    );
  },
);

const styles = createTheme({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: getColor(Color.bg1),
  },
  input: {
    minHeight: 36,
    height: 36,
    maxHeight: 36,
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    flex: 1,
  },
});
