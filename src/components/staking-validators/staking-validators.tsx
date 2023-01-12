import React, {useCallback, useState} from 'react';

import {SectionList} from 'react-native';

import {CustomHeader, Loading, Spacer} from '@app/components/ui';
import {SectionHeader} from '@app/components/ui/section-header';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {ValidatorItem} from '@app/types';

import {ValidatorRow} from './validator-row';

export type StakingValidatorsProps = {
  stakedValidators: ValidatorItem[];
  unStakedValidators: ValidatorItem[];
  onPress: (validator: ValidatorItem) => void;
  onGoBack: () => void;
};
export const StakingValidators = ({
  stakedValidators,
  unStakedValidators,
  onPress,
  onGoBack,
}: StakingValidatorsProps) => {
  const [search, setSearch] = useState('');

  const onSearchChange = useCallback((text: string) => {
    setSearch(text.toLowerCase());
  }, []);

  const validators = [
    {
      title: getText(I18N.stakingValidatorsStaked),
      data: stakedValidators.filter(v => v.searchString?.includes(search)),
    },
    {
      title: getText(I18N.stakingValidatorsUnStaked),
      data: unStakedValidators.filter(v => v.searchString?.includes(search)),
    },
  ].filter(r => !!r.data.length);

  return (
    <>
      <CustomHeader
        onSearchChange={onSearchChange}
        title={I18N.stakingValidators}
        iconRight="search"
        iconLeft="arrow_back"
        onPressLeft={onGoBack}
      />
      <Spacer height={12} />
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
    </>
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
