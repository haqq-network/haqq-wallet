import React, {useMemo} from 'react';

import {Switch, TouchableWithoutFeedback, View} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';

import {Icon, IconsName, Text} from '@app/components/ui';
import {ValidatorSortKey} from '@app/helpers/validators-sort';
import {I18N, getText} from '@app/i18n';
import {Color, createTheme} from '@app/theme';

type UnstackedHeaderProps = {
  isSwitchOn?: boolean;
  toggleSwitch: () => void;
  sortBy: ValidatorSortKey;
  onSortSelect: (key: ValidatorSortKey) => void;
};

export const UnstackedHeader = ({
  isSwitchOn,
  toggleSwitch,
  sortBy,
  onSortSelect,
}: UnstackedHeaderProps) => {
  const rendererProps = useMemo(
    () => ({anchorStyle: {opacity: 0}, placement: 'bottom'}),
    [],
  );
  const menuTriggerCustomStyles = useMemo(
    () => ({TriggerTouchableComponent: TouchableWithoutFeedback}),
    [],
  );
  const optionCustomStyles = useMemo(
    () => ({OptionTouchableComponent: TouchableWithoutFeedback}),
    [],
  );

  const sortTitle = useMemo(() => {
    switch (sortBy) {
      case ValidatorSortKey.random:
        return getText(I18N.sortValidatorOptionRandom);
      case ValidatorSortKey.nameAsc:
        return getText(I18N.sortValidatorOptionName, {
          key: getText(I18N.sortAsc),
        });
      case ValidatorSortKey.nameDesc:
        return getText(I18N.sortValidatorOptionName, {
          key: getText(I18N.sortDesc),
        });
      case ValidatorSortKey.commissionAsc:
        return getText(I18N.sortValidatorOptionCommission, {
          key: getText(I18N.sortAsc),
        });
      case ValidatorSortKey.commissionDesc:
        return getText(I18N.sortValidatorOptionCommission, {
          key: getText(I18N.sortDesc),
        });
      case ValidatorSortKey.powerAsc:
        return getText(I18N.sortValidatorOptionPower, {
          key: getText(I18N.sortAsc),
        });
      case ValidatorSortKey.powerDesc:
        return getText(I18N.sortValidatorOptionPower, {
          key: getText(I18N.sortDesc),
        });
      default:
        return getText(I18N.sortValidatorOptionRandom);
    }
  }, [sortBy]);

  return (
    <View style={styles.sortSectionContainer}>
      <Menu
        renderer={renderers.Popover}
        rendererProps={rendererProps}
        onSelect={onSortSelect}>
        <MenuTrigger customStyles={menuTriggerCustomStyles}>
          <View style={styles.row}>
            <Icon name={IconsName.arrow_sort} color={Color.textBase1} />
            <Text
              t9
              i18n={I18N.sortValidatorTitle}
              i18params={{sortTitle}}
              style={styles.sortTitle}
            />
          </View>
        </MenuTrigger>
        <MenuOptions
          optionsContainerStyle={styles.menuOptionsContainer}
          customStyles={optionCustomStyles}>
          <MenuOption value={ValidatorSortKey.random}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionRandom}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.nameAsc}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionName}
              i18params={{key: getText(I18N.sortAsc)}}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.nameDesc}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionName}
              i18params={{key: getText(I18N.sortDesc)}}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.powerAsc}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionPower}
              i18params={{key: getText(I18N.sortAsc)}}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.powerDesc}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionPower}
              i18params={{key: getText(I18N.sortDesc)}}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.commissionAsc}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionCommission}
              i18params={{key: getText(I18N.sortAsc)}}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.commissionDesc}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionCommission}
              i18params={{key: getText(I18N.sortDesc)}}
              color={Color.textBase1}
            />
          </MenuOption>
        </MenuOptions>
      </Menu>
      <View style={styles.row}>
        <Text i18n={I18N.showInactive} color={Color.textBase1} />
        <Switch value={isSwitchOn} onChange={toggleSwitch} />
      </View>
    </View>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: Color.bg1,
  },
  sortTitle: {
    fontSize: 12,
  },
  menuOptionsContainer: {
    padding: 8,
    backgroundColor: Color.bg1,
    shadowColor: Color.shadowColor3,
  },
});
