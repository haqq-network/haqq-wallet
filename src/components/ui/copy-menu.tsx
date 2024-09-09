import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {observer} from 'mobx-react';
import {
  I18nManager,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

import {Color} from '@app/colors';
import {SolidLine} from '@app/components/solid-line';
import {Icon, IconsName} from '@app/components/ui/icon';
import Popover from '@app/components/ui/popover';
import {RTLReverse} from '@app/components/ui/rtl-reverse';
import {Spacer} from '@app/components/ui/spacer';
import {Text, TextVariant} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {sendNotification} from '@app/services';

export type CopyMenuProps = ViewProps & {
  value: string;
  withSettings?: boolean;
};

export const CopyMenu = observer(
  ({children, value, style, withSettings = false}: CopyMenuProps) => {
    const navigation = useTypedNavigation();

    const onCopyPress = useCallback(() => {
      Clipboard.setString(value);
      sendNotification(I18N.notificationCopied);
    }, [value]);

    const onBech32CopyPress = useCallback(() => {
      Clipboard.setString(AddressUtils.toHaqq(value));
      sendNotification(I18N.notificationCopied);
    }, [value]);

    const onPressSettings = useCallback(() => {
      navigation.navigate('homeSettings', {
        screen: 'settingsAccounts',
        params: {
          screen: 'settingsAccountDetail',
          params: {address: value, fromHomePage: true},
        },
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
      <Menu renderer={Popover} rendererProps={rendererProps}>
        <MenuTrigger customStyles={menuTriggerCustomStyles}>
          <View style={containerStyle}>{children}</View>
        </MenuTrigger>
        <MenuOptions
          optionsContainerStyle={styles.optionsContainer}
          customStyles={optionCustomStyles}>
          <MenuOption onSelect={onCopyPress} style={styles.option}>
            <RTLReverse>
              <Text variant={TextVariant.t11} i18n={I18N.copyAddress} />
              <Icon i22 name={IconsName.copy} color={Color.textBase1} />
            </RTLReverse>
          </MenuOption>
          {Provider.selectedProvider.config.isBech32Enabled && (
            <>
              <SolidLine width="100%" color={Color.graphicSecond2} />
              <MenuOption onSelect={onBech32CopyPress} style={styles.option}>
                <RTLReverse>
                  <Text
                    variant={TextVariant.t11}
                    i18n={I18N.copyBech32Address}
                  />
                  <Spacer width={16} />
                  <Icon i22 name={IconsName.copy} color={Color.textBase1} />
                </RTLReverse>
              </MenuOption>
            </>
          )}
          {withSettings && (
            <>
              <SolidLine width="100%" color={Color.graphicSecond2} />
              <MenuOption onSelect={onPressSettings} style={styles.option}>
                <RTLReverse>
                  <Text
                    variant={TextVariant.t11}
                    i18n={I18N.homeSettingsTitle}
                  />
                  <Icon i22 name={IconsName.settings} color={Color.textBase1} />
                </RTLReverse>
              </MenuOption>
            </>
          )}
        </MenuOptions>
      </Menu>
    );
  },
);

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsContainer: {
    borderRadius: 12,
    backgroundColor: Color.graphicSecond1,
    transform: [{translateX: I18nManager.isRTL ? +32 : -32}],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
    backgroundColor: Color.transparent,
  },
});
