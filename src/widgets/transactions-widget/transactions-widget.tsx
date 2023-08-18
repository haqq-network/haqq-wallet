import React from 'react';

import {StyleSheet} from 'react-native';

import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';

type Props = {
  onPress: () => void;
};

const TransactionsWidget = ({onPress}: Props) => {
  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader title={'Last transactions'} />
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});

export {TransactionsWidget};
