import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {useThematicStyles} from '@app/hooks';

export type SectionHeaderProps = {title: string};
export const SectionHeader = ({title}: SectionHeaderProps) => {
  const styles = useThematicStyles(stylesObj);

  return (
    <View style={styles.section}>
      <Text t13 color={Color.textBase2}>
        {title}
      </Text>
    </View>
  );
};

const stylesObj = StyleSheet.create({
  section: {
    backgroundColor: Color.bg1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
