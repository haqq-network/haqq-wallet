import React, {useCallback, useState} from 'react';

import {SectionList, View} from 'react-native';

import {Color} from '@app/colors';
import {
  CustomHeader,
  Icon,
  IconsName,
  Loading,
  Spacer,
  Text,
} from '@app/components/ui';
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
      data: Array.isArray(stakedValidators)
        ? stakedValidators.filter(v => v.searchString?.includes(search))
        : [],
    },
    {
      title: getText(I18N.stakingValidatorsUnStaked),
      data: Array.isArray(unStakedValidators)
        ? unStakedValidators.filter(v => v.searchString?.includes(search))
        : [],
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
        renderSectionHeader={({section: {title}}) => {
          return (
            <View>
              {/*When validators array has only one object it means only one unstacked section.
              In this case title should be shown*/}
              {validators.length > 1 && <SectionHeader title={title} />}
              {/*Sort by random hint section should be shown only for unstacked validators*/}
              {title === getText(I18N.stakingValidatorsUnStaked) && (
                <View style={styles.sortSectionContainer}>
                  <Icon name={IconsName.arrow_sort} color={Color.textBase1} />
                  <Text t9 i18n={I18N.byRandomTitle} style={styles.sortTitle} />
                </View>
              )}
            </View>
          );
        }}
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
  sortSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  sortTitle: {
    fontSize: 12,
  },
});
