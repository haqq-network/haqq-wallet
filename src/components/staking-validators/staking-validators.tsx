import React from 'react';

import {SectionList} from 'react-native';

import {Loading} from '@app/components/ui';
import {SectionHeader} from '@app/components/ui/section-header';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {ValidatorItem} from '@app/types';

import {ValidatorRow} from './validator-row';

export type StakingValidatorsProps = {
  stakedValidators: ValidatorItem[];
  unStakedValidators: ValidatorItem[];
  onPress: (validator: ValidatorItem) => void;
};
export const StakingValidators = ({
  stakedValidators,
  unStakedValidators,
  onPress,
}: StakingValidatorsProps) => {
  const validators = [
    {title: getText(I18N.stakingValidatorsStaked), data: stakedValidators},
    {title: getText(I18N.stakingValidatorsUnStaked), data: unStakedValidators},
  ].filter(r => !!r.data.length);

  return (
    <SectionList
      style={styles.container}
      renderItem={({item}) => <ValidatorRow item={item} onPress={onPress} />}
      renderSectionHeader={({section: {title}}) => (
        <SectionHeader title={title} />
      )}
      ListEmptyComponent={Loading}
      contentContainerStyle={styles.grow}
      sections={validators}
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
