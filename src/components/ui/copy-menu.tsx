import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {TouchableWithoutFeedback, View, ViewProps} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';

import {Color} from '@app/colors';
import {Icon, IconsName} from '@app/components/ui/icon';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {Cosmos} from '@app/services/cosmos';
import {PLACEHOLDER_GRAY} from '@app/variables/common';

export type CopyMenuProps = ViewProps & {
  value: string;
  withSettings?: boolean;
};

export const CopyMenu = ({
  children,
  value,
  style,
  withSettings = false,
}: CopyMenuProps) => {
  const navigation = useTypedNavigation();

  const onCopyPress = useCallback(() => {
    Clipboard.setString(value);
    sendNotification(I18N.notificationCopied);
  }, [value]);

  const onBech32CopyPress = useCallback(() => {
    Clipboard.setString(Cosmos.addressToBech32(value));
    sendNotification(I18N.notificationCopied);
  }, [value]);

  const onPressSettings = useCallback(() => {
    navigation.navigate('homeSettings', {
      screen: 'settingsAccounts',
      params: {screen: 'settingsAccountDetail', params: {address: value}},
    });
  }, [value]);

  const containerStyle = useMemo(() => [styles.container, style], [style]);
  const rendererProps = useMemo(
    () => ({anchorStyle: {opacity: 0}, placement: 'bottom'}),
    [],
  );
  const menuTriggerCustomStyles = useMemo(
    () => ({TriggerTouchableComponent: TouchableWithoutFeedback}),
    [],
  );
  const optionCustomStyles = useMemo(
    () => ({OptionTouchableComponent: TouchableWithoutFeedback}),
    [],
  );

  return (
    <Menu renderer={renderers.Popover} rendererProps={rendererProps}>
      <MenuTrigger customStyles={menuTriggerCustomStyles}>
        <View style={containerStyle}>{children}</View>
      </MenuTrigger>
      <MenuOptions
        optionsContainerStyle={styles.optionsContainer}
        customStyles={optionCustomStyles}>
        <MenuOption onSelect={onCopyPress} style={styles.option}>
          <Text t11 i18n={I18N.copyAddress} />
          <Icon i18 name={IconsName.copy} color={Color.textBase1} />
        </MenuOption>
        <View style={styles.divider} />
        <MenuOption onSelect={onBech32CopyPress} style={styles.option}>
          <Text t11 i18n={I18N.copyBech32Address} />
          <View style={styles.horizontalSpace} />
          <Icon i18 name={IconsName.copy} color={Color.textBase1} />
        </MenuOption>
        {withSettings && <View style={styles.divider} />}
        {withSettings && (
          <MenuOption onSelect={onPressSettings} style={styles.option}>
            <Text t11 i18n={I18N.homeSettingsTitle} />
            <Icon i18 name={IconsName.settings} color={Color.textBase1} />
          </MenuOption>
        )}
      </MenuOptions>
    </Menu>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {height: 1, width: '100%', backgroundColor: PLACEHOLDER_GRAY},
  optionsContainer: {
    borderRadius: 8,
    backgroundColor: Color.bg3,
  },
  horizontalSpace: {width: 16},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
    backgroundColor: Color.bg3,
  },
});
