import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {FlatList, ListRenderItem, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {BrowserPermissionTuple} from '@app/models/browser-permission';
import {Link} from '@app/types';
import {uppercaseFirtsLetter} from '@app/utils';

import {LinkPreview, LinkPreviewVariant} from './link-preview';
import {Icon, IconsName, Input, Spacer} from './ui';

export interface BrowserPrivacyProps {
  permissionMap: BrowserPermissionTuple[];

  onLinkPress?(link: Link): void;
}

export const BrowserPrivacy = observer(
  ({onLinkPress, permissionMap = []}: BrowserPrivacyProps) => {
    const [text, setText] = useState('');
    const filteredPermissions = useMemo(
      () =>
        text
          ? permissionMap?.filter(([hostname]: BrowserPermissionTuple) => {
              return hostname
                ?.toLowerCase?.()
                ?.includes?.(text?.toLowerCase?.());
            })
          : permissionMap,
      [permissionMap, text],
    );

    const onChangeText = useCallback((str: string) => {
      setText(str?.trim?.());
    }, []);

    const privacyKeyExtractor = useCallback(
      ([hostname]: BrowserPermissionTuple) => hostname,
      [],
    );

    const renderHistoryItem: ListRenderItem<BrowserPermissionTuple> =
      useCallback(
        ({item}) => {
          if (!item) {
            return null;
          }
          const [hostname, permissions] = item;

          const allowedPermissionsNames = Object.entries(permissions)
            .map(([type]) => uppercaseFirtsLetter(type))
            .join(', ');

          const link: Link = {
            id: hostname,
            title: hostname,
            subtitle: allowedPermissionsNames,
            url: `https://${hostname}`,
          };

          return (
            <>
              <Spacer height={16} />
              <LinkPreview
                link={link}
                onPress={onLinkPress}
                variant={LinkPreviewVariant.line}
              />
            </>
          );
        },
        [onLinkPress],
      );

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Input
            leftAction={
              <Icon i16 color={Color.graphicBase2} name={IconsName.search} />
            }
            value={text}
            onChangeText={onChangeText}
            placeholder={getText(I18N.browserSearch)}
            style={styles.inputContainer}
            inputStyle={styles.input}
          />
        </View>

        <FlatList
          data={filteredPermissions}
          renderItem={renderHistoryItem}
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
    height: '100%',
    width: '100%',
    alignSelf: 'center',
  },
  inputContainer: {
    minHeight: 36,
    height: 36,
    maxHeight: 36,
    flex: 1,
  },
});
