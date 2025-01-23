import {PropsWithChildren} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {Spacer, Text, TextVariant} from './ui';

type ChipProps = {
  title: string;
  subtitle?: string;
};

export const Chip = ({
  title,
  subtitle,
  children,
}: PropsWithChildren<ChipProps>) => {
  return (
    <TouchableOpacity>
      <View style={styles.container}>
        <Text variant={TextVariant.t13} color={Color.textGreen1}>
          {title}
        </Text>
        {subtitle && (
          <>
            <Spacer width={4} />
            <Text variant={TextVariant.t13} color={Color.textGreen1}>
              {subtitle}
            </Text>
          </>
        )}
        {children && (
          <>
            <Spacer width={4} />
            {children}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Color.textGreen1,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Color.bg1,
  },
});
