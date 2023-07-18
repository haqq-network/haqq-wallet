import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {shortAddress} from '@app/helpers/short-address';
import {TransactionListReceive} from '@app/types';

export type TransactionPreviewProps = {
  item: TransactionListReceive;
  onPress: (hash: string) => void;
};

export const TransactionReceive = ({
  item,
  onPress,
}: TransactionPreviewProps) => {
  const subtitle = useMemo(
    () => `from ${shortAddress(item.from, '•')}`,
    [item.from],
  );
  const text = useMemo(() => `+${cleanNumber(item.value)} ISLM`, [item.value]);
  const handlePress = useCallback(() => {
    onPress(item.hash);
  }, [item.hash, onPress]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name="arrow_receive" color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          title="Received"
          subtitle={subtitle}
          short
        />
        <Text t11 color={Color.textGreen1}>
          {text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
