import React, {useCallback} from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton, IconsName, Spacer, Text} from '@app/components/ui';
import {openURL} from '@app/helpers';
import {useThematicStyles} from '@app/hooks';
import {I18N} from '@app/i18n';

type SettingsAboutButtonProps = {
  i18n: I18N;
  name: IconsName | keyof typeof IconsName;
  color: Color;
  url: string;
};

export const SettingsAboutButton = ({
  i18n,
  name,
  color,
  url,
}: SettingsAboutButtonProps) => {
  const onPress = useCallback(() => {
    openURL(url);
  }, [url]);
  const styles = useThematicStyles(stylesObj);

  return (
    <IconButton onPress={onPress} style={styles.button}>
      <Icon i24 name={name} color={color} />
      <Text t11 i18n={i18n} style={styles.buttonText} />
      <Spacer />
      <Icon i24 name="arrow_forward" color={Color.graphicSecond3} />
    </IconButton>
  );
};

const stylesObj = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  buttonText: {
    marginLeft: 12,
    color: Color.textBase1,
  },
});
