import React, {useCallback, useMemo, useReducer, useState} from 'react';

import {
  SectionList,
  SectionListData,
  SectionListRenderItemInfo,
} from 'react-native';

import {SectionHeader} from '@app/components/staking-validators/headers/section-header';
import {UnstackedHeader} from '@app/components/staking-validators/headers/unstacked-header';
import {CustomHeader, Loading, Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {ValidatorSortKey, validatorsSort} from '@app/helpers/validators-sort';
import {I18N, getText} from '@app/i18n';
import {ValidatorItem, ValidatorStatus} from '@app/types';

import {ValidatorRow} from './validator-row';

export type StakingValidatorsProps = {
  stakedValidators: Validators;
  unStakedValidators: Validators;
  onPress: (validator: ValidatorItem) => void;
  onGoBack: () => void;
};

export type Validators = {
  active: ValidatorItem[];
  inactive: ValidatorItem[];
  jailed: ValidatorItem[];
};

type ValidatorSection = {
  title: string;
  data: ValidatorItem[];
};

export const StakingValidators = ({
  stakedValidators,
  unStakedValidators,
  onPress,
  onGoBack,
}: StakingValidatorsProps) => {
  const [search, setSearch] = useState('');
  const [isShowInactive, setIsShowInactive] = useReducer(
    state => !state,
    false,
  );
  const [sortBy, setSortBy] = useState<ValidatorSortKey>(
    ValidatorSortKey.random,
  );

  const onSearchChange = useCallback((text: string) => {
    setSearch(text.toLowerCase());
  }, []);

  const validators: ValidatorSection[] = useMemo(
    () =>
      [
        {
          title: getText(I18N.stakingValidatorsStaked),
          data: [
            stakedValidators.active,
            stakedValidators.inactive,
            stakedValidators.jailed,
          ]
            .flat()
            .filter(v => v.searchString?.includes(search)),
        },
        {
          title: getText(I18N.stakingValidatorsUnStaked),
          data: [
            validatorsSort(unStakedValidators.active, sortBy),
            validatorsSort(unStakedValidators.inactive, sortBy),
            validatorsSort(unStakedValidators.jailed, sortBy),
          ]
            .flat()
            .filter(
              v =>
                (v.searchString?.includes(search) && isShowInactive) ||
                v.localStatus === ValidatorStatus.active,
            ),
        },
      ].filter(r => !!r.data.length),
    [stakedValidators, unStakedValidators, isShowInactive, search, sortBy],
  );

  const renderItem = useCallback(
    ({item}: SectionListRenderItemInfo<ValidatorItem>) => (
      <ValidatorRow item={item} onPress={onPress} />
    ),
    [onPress],
  );

  const renderSectionHeader = useCallback(
    ({section: {title}}: {section: SectionListData<ValidatorItem>}) => {
      return (
        <>
          {/*When validators array has only one object it means only one unstacked section.
              In this case title should not be shown*/}
          {validators.length > 1 && <SectionHeader title={title} />}
          {/*Sort by random hint section should be shown only for unstacked validators*/}
          {title === getText(I18N.stakingValidatorsUnStaked) && (
            <UnstackedHeader
              isSwitchOn={isShowInactive}
              toggleSwitch={setIsShowInactive}
              onSortSelect={setSortBy}
              sortBy={sortBy}
            />
          )}
        </>
      );
    },
    [validators.length, isShowInactive, sortBy],
  );

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
        renderItem={renderItem}
        keyExtractor={item => item.operator_address}
        renderSectionHeader={renderSectionHeader}
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
