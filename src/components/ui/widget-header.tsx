import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Spacer, Text, TextVariant} from '@app/components/ui';

type Props = {
  icon?: IconsName | keyof typeof IconsName;
  title: string;
  description?: string;
  lable?: string;
  largeIcon?: boolean;
};

export const WidgetHeader = ({
  icon,
  title,
  description,
  largeIcon,
  lable,
}: Props) => {
  if (largeIcon) {
    return (
      <View style={styles.row}>
        {!!icon && <Icon i62 name={icon} color={Color.graphicGreen1} />}
        <View style={[styles.column, styles.textWrapper]}>
          <Text variant={TextVariant.t8}>{title}</Text>
          {!!description && (
            <Text variant={TextVariant.t14} style={styles.description}>
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
        <Text variant={TextVariant.t8} style={icon && styles.title}>
          {title}
        </Text>
        {!!lable && (
          <>
            <Spacer width={8} />
            <Text variant={TextVariant.t14} color={Color.textBase2}>
              {lable}
            </Text>
          </>
        )}
      </View>
      {!!description && (
        <Text variant={TextVariant.t14} style={styles.description}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {flexDirection: 'column'},
  row: {flexDirection: 'row', alignItems: 'center'},
  title: {marginLeft: 4},
  textWrapper: {marginLeft: 10, flex: 1},
  description: {marginTop: 3},
});
