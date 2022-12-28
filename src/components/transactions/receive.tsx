import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, Text} from '@app/components/ui';
import {useThematicStyles} from '@app/hooks';
import {TransactionListReceive} from '@app/types';
import {shortAddress} from '@app/utils';

export type TransactionPreviewProps = {
  item: TransactionListReceive;
  onPress: (hash: string) => void;
};

export const TransactionReceive = ({
  item,
  onPress,
}: TransactionPreviewProps) => {
  const styles = useThematicStyles(stylesObj);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.hash);
      }}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name="arrow_receive" color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          title="Received"
          subtitle={`from ${shortAddress(item.from, '•')}`}
          short
        />
        <Text t11 color={Color.textGreen1}>
          {`+${item.value.toFixed(2)} ISLM`}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const stylesObj = StyleSheet.create({
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
