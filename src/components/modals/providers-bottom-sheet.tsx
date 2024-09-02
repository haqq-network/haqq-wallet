import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {FlatList} from 'react-native';

import {Color} from '@app/colors';
import {BottomSheet} from '@app/components/bottom-sheet';
import {Icon, IconsName, Spacer, TextField} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {ModalType, Modals} from '@app/types';

import {SettingsProvidersAllNetworksRow} from '../settings/settings-providers/settings-providers-all-networks-row';
import {SettingsProvidersRow} from '../settings/settings-providers/settings-providers-row';

export function ProvidersBottomSheet({
  title,
  providers,
  initialProviderId: initialProvider,
  closeDistance,
  eventSuffix = '',
  onClose,
}: Modals[ModalType.providersBottomSheet]) {
  const [searchProviderValue, setSearchProviderValue] = useState('');

  const closeDistanceCalculated = useCalculatedDimensionsValue(
    () => closeDistance?.(),
    [closeDistance],
  );
  const onPressProvider = useCallback(
    (providerId: string) => {
      if (providerId === initialProvider) {
        // close if selected same provider
        return onCloseModal();
      }
      onClose?.();
      app.emit(`provider-selected${eventSuffix}`, providerId);
    },
    [eventSuffix, onClose],
  );

  const onCloseModal = () => {
    app.emit(`provider-selected-reject${eventSuffix}`);
    onClose?.();
  };

  useEffect(() => {
    return () => {
      app.emit(`provider-selected-reject${eventSuffix}`);
    };
  }, [onPressProvider, eventSuffix]);

  const visibleProviders = useMemo(() => {
    if (!searchProviderValue) {
      return providers;
    }

    return providers.filter(provider => {
      const providerName = provider.name.toLowerCase();
      const providerCoinName = provider.coinName.toLowerCase();
      const providerDenom = provider.denom.toLowerCase();
      const providerChainId = provider.ethChainId
        .toString()
        .toLocaleLowerCase();

      const searchValue = searchProviderValue.toLocaleLowerCase();

      return (
        providerName.includes(searchValue) ||
        providerCoinName.includes(searchValue) ||
        providerDenom.includes(searchValue) ||
        providerChainId.includes(searchValue)
      );
    });
  }, [providers, searchProviderValue]);

  return (
    <BottomSheet
      onClose={onCloseModal}
      contentContainerStyle={styles.container}
      closeDistance={closeDistanceCalculated}
      i18nTitle={title}>
      <TextField
        label={I18N.browserSearch}
        value={searchProviderValue}
        onChangeText={setSearchProviderValue}
        leading={
          <Icon i24 name={IconsName.search} color={Color.graphicBase2} />
        }
        style={styles.searchField}
      />
      <FlatList
        data={visibleProviders}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          if (item.id === 'all_networks') {
            return (
              <SettingsProvidersAllNetworksRow
                providerId={initialProvider}
                item={item}
                onPress={onPressProvider}
              />
            );
          }

          return (
            <SettingsProvidersRow
              providerId={initialProvider}
              item={item}
              onPress={onPressProvider}
            />
          );
        }}
      />
      <Spacer height={50} />
    </BottomSheet>
  );
}

const styles = createTheme({
  container: {
    height: '50%',
  },
  searchField: {marginBottom: 16},
});
