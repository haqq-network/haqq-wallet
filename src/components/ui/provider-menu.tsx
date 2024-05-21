import React, {memo, useCallback, useMemo, useState} from 'react';

import {TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

import {Color} from '@app/colors';
import {SolidLine} from '@app/components/solid-line';
import {Icon, IconsName} from '@app/components/ui/icon';
import Popover from '@app/components/ui/popover';
import {Text, TextPosition, TextVariant} from '@app/components/ui/text';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';

export const ProviderMenu = memo(() => {
  const [state, setState] = useState<'open' | 'close'>('close');
  const providers = Provider.getAll().snapshot();
  const currentProvider = Provider.getById(app.providerId);

  const onSelect = useCallback((provider: Provider) => {
    close();
    app.providerId = provider.id;
  }, []);
  const open = useCallback(() => {
    setState('open');
  }, []);
  const close = useCallback(() => {
    setState('close');
  }, []);

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

  return (
    <Menu
      onBackdropPress={close}
      opened={state === 'open'}
      renderer={Popover}
      rendererProps={rendererProps}>
      <MenuTrigger customStyles={menuTriggerCustomStyles}>
        <TouchableOpacity onPress={open} style={styles.wrapper}>
          <Text
            color={Color.textBase2}
            variant={TextVariant.t14}
            position={TextPosition.center}>
            {currentProvider?.name}
          </Text>
          <Icon
            i12
            name={IconsName.arrow_forward}
            style={styles.arrowIcon}
            color={Color.textBase2}
          />
        </TouchableOpacity>
      </MenuTrigger>
      <MenuOptions
        optionsContainerStyle={styles.optionsContainer}
        customStyles={optionCustomStyles}>
        {providers.map((provider, index) => {
          const isLast = index === providers.length;
          const isSelected = currentProvider?.id === provider.id;
          return (
            <View key={provider.id}>
              <MenuOption
                onSelect={() => onSelect(provider)}
                style={styles.option}>
                <View style={styles.column}>
                  <Text
                    variant={TextVariant.t11}
                    children={provider.name}
                    color={Color.textBase1}
                  />
                  <Text
                    variant={TextVariant.t11}
                    children={`${provider.name} (${provider.ethChainId})`}
                    color={Color.textBase2}
                  />
                </View>
                <Icon
                  i22
                  name={IconsName.check}
                  color={isSelected ? Color.graphicGreen1 : Color.transparent}
                />
              </MenuOption>
              {!isLast && (
                <SolidLine width="100%" color={Color.graphicSecond2} />
              )}
            </View>
          );
        })}
      </MenuOptions>
    </Menu>
  );
});

const styles = createTheme({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    transform: [{rotate: '90deg'}],
    marginBottom: 6,
    marginLeft: 4,
  },
  column: {flexDirection: 'column'},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsContainer: {
    borderRadius: 12,
    backgroundColor: Color.bg1,
    opacity: 0.97,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 220,
    height: 62,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
});
