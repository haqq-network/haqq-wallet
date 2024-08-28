import React from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {SettingsStackParamList, SettingsStackRoutes} from '@app/route-types';

import {
  DataContent,
  Icon,
  IconsName,
  MenuNavigationButton,
  Text,
  TextPosition,
  TextVariant,
} from '../ui';

export type SettingsButtonProps = {
  next: SettingsStackRoutes;
  icon: IconsName | keyof typeof IconsName;
  title: I18N;
  rightTitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const SettingsButton = ({
  icon,
  title,
  next,
  style,
  rightTitle,
  testID,
}: SettingsButtonProps) => {
  const navigation = useTypedNavigation<SettingsStackParamList>();

  //FIXME: Test this
  //@ts-ignore
  const onClickButton = () => navigation.navigate(next);

  return (
    <MenuNavigationButton testID={testID} onPress={onClickButton} style={style}>
      <View style={styles.container}>
        <Icon i24 name={icon} color={Color.graphicBase1} />
        <DataContent titleI18n={title} style={styles.text} />
        {rightTitle && (
          <Text
            variant={TextVariant.t11}
            position={TextPosition.center}
            style={styles.textRight}
            color={Color.textBase2}>
            {rightTitle}
          </Text>
        )}
      </View>
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    marginLeft: 12,
  },
  textRight: {
    flex: 1,
    marginRight: 20,
  },
});
