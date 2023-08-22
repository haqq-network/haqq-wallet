import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Text} from '@app/components/ui';

type Props = {
  icon?: IconsName | keyof typeof IconsName;
  title: string;
  description?: string;
  largeIcon?: boolean;
};

export const WidgetHeader = ({icon, title, description, largeIcon}: Props) => {
  if (largeIcon) {
    return (
      <View style={styles.row}>
        {!!icon && <Icon i62 name={icon} color={Color.graphicGreen1} />}
        <View style={[styles.column, styles.textWrapper]}>
          <Text t8>{title}</Text>
          {!!description && (
            <Text t14 style={styles.description}>
              {description}
            </Text>
          )}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.column}>
      <View style={styles.row}>
        {!!icon && <Icon name={icon} color={Color.graphicBase1} />}
        <Text t8 style={icon && styles.title}>
          {title}
        </Text>
      </View>
      {!!description && (
        <Text t14 style={styles.description}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {flexDirection: 'column'},
  row: {flexDirection: 'row'},
  title: {marginLeft: 4},
  textWrapper: {marginLeft: 10, flex: 1},
  description: {marginTop: 3},
});
