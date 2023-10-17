import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {StyleSheet, View, ViewProps} from 'react-native';
import {NativeSyntheticEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import ContextMenu, {
  ContextMenuAction,
  ContextMenuOnPressNativeEvent,
} from 'react-native-context-menu-view';

import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {Cosmos} from '@app/services/cosmos';

export type CopyMenuProps = ViewProps & {
  value: string;
};

export const CopyMenu = ({children, value, style}: CopyMenuProps) => {
  const onPress = useCallback(
    (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
      switch (e.nativeEvent.index) {
        case 0:
          Clipboard.setString(value);
          sendNotification(I18N.notificationCopied);
          break;
        case 1:
          Clipboard.setString(Cosmos.addressToBech32(value));
          sendNotification(I18N.notificationCopied);
          break;
      }
    },
    [value],
  );

  const containerStyle = useMemo(() => [page.container, style], [style]);
  const actionItems: ContextMenuAction[] = useMemo(
    () => [
      {
        title: 'Copy address',
      },
      {
        title: 'Copy bech32 address',
      },
    ],
    [],
  );

  return (
    <ContextMenu dropdownMenuMode actions={actionItems} onPress={onPress}>
      <View style={containerStyle}>{children}</View>
    </ContextMenu>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
