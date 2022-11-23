import React from 'react';

import {FlatList} from 'react-native';

import {Loading} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {ValidatorItem} from '@app/types';

import {ValidatorRow} from './validator-row';

export type StakingValidatorsProps = {
  validators: ValidatorItem[];
  onPress: (validator: ValidatorItem) => void;
};
export const StakingValidators = ({
  validators,
  onPress,
}: StakingValidatorsProps) => {
  return (
    <FlatList
      style={styles.container}
      data={validators}
      renderItem={({item}) => <ValidatorRow item={item} onPress={onPress} />}
      ListEmptyComponent={Loading}
      contentContainerStyle={styles.grow}
    />
  );
};

const styles = createTheme({
  container: {
    flex: 1,
  },
  grow: {
    flexGrow: 1,
  },
});
