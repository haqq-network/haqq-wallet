import React, {useMemo} from 'react';

import {Switch, TouchableWithoutFeedback, View} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';

import {Color} from '@app/colors';
import {Icon, IconsName, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {ValidatorSortKey} from '@app/helpers/validators-sort';
import {I18N, getText} from '@app/i18n';

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
      case ValidatorSortKey.name:
        return getText(I18N.sortValidatorOptionName);
      case ValidatorSortKey.commission:
        return getText(I18N.sortValidatorOptionCommission);
      case ValidatorSortKey.power:
        return getText(I18N.sortValidatorOptionPower);
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
          <MenuOption value={ValidatorSortKey.name}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionName}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.power}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionPower}
              color={Color.textBase1}
            />
          </MenuOption>
          <MenuOption value={ValidatorSortKey.commission}>
            <Text
              t11
              i18n={I18N.sortValidatorOptionCommission}
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
