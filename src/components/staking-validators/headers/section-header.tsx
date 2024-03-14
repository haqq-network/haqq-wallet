import React from 'react';

import {View} from 'react-native';

import {Text} from '@app/components/ui/text';
import {Color, createTheme} from '@app/theme';

export type SectionHeaderProps = {title: string};
export const SectionHeader = ({title}: SectionHeaderProps) => {
  return (
    <View style={styles.section}>
      <Text t13 color={Color.textBase2}>
        {title}
      </Text>
    </View>
  );
};

const styles = createTheme({
  section: {
    backgroundColor: Color.bg1,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
