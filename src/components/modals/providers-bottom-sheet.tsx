import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Color} from '@app/colors';
import {BottomSheet, BottomSheetRef} from '@app/components/bottom-sheet';
import {Icon, IconsName, Spacer, TextField} from '@app/components/ui';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {I18N} from '@app/i18n';
import {ALL_NETWORKS_ID, Provider} from '@app/models/provider';
import {ChainId, ModalType, Modals} from '@app/types';

import {SettingsProvidersAllNetworksRow} from '../settings/settings-providers/settings-providers-all-networks-row';
import {SettingsProvidersRow} from '../settings/settings-providers/settings-providers-row';

export function ProvidersBottomSheet({
  title,
  providers: outProviders,
  initialProviderChainId,
  closeDistance,
  eventSuffix = '',
  onClose,
  disableAllNetworksOption,
}: Modals[ModalType.providersBottomSheet]) {
  const [searchProviderValue, setSearchProviderValue] = useState('');
  const bsRef = useRef<BottomSheetRef>(null);
  const selectedProvider = useRef<ChainId>(0);

  const providers = useMemo(() => {
    if (outProviders?.length) {
      return outProviders;
    }

    if (disableAllNetworksOption) {
      return Provider.getAll().filter(p => p.id !== ALL_NETWORKS_ID);
    }

    return Provider.getAll();
  }, [disableAllNetworksOption, outProviders]);

  const closeDistanceCalculated = useCalculatedDimensionsValue(
    () => closeDistance?.(),
    [closeDistance],
  );
  const onPressProvider = useCallback(
    async (providerChainId: ChainId) => {
      if (
        !!initialProviderChainId &&
        providerChainId === initialProviderChainId
      ) {
        // close if selected same provider
        return onCloseModal();
      }
      // if you call app.emit('provider-selected') event here
      // it crash app.
      selectedProvider.current = providerChainId;
      onClose?.();
    },
    [eventSuffix, onClose],
  );

  const onCloseModal = () => {
    app.emit(`provider-selected-reject${eventSuffix}`);
    onClose?.();
  };

  useEffect(() => {
    return () => {
      if (selectedProvider.current) {
        app.emit(
          `provider-selected${eventSuffix}`,
          Provider.getByEthChainId(selectedProvider.current)?.id,
        );
      } else {
        app.emit(`provider-selected-reject${eventSuffix}`);
      }
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
      ref={bsRef}
      onClose={onCloseModal}
      contentContainerStyle={styles.container}
      closeDistance={closeDistanceCalculated}
      scrollable
      renderContentHeader={() => (
        <TextField
          label={I18N.browserSearch}
          value={searchProviderValue}
          onChangeText={setSearchProviderValue}
          leading={
            <Icon i24 name={IconsName.search} color={Color.graphicBase2} />
          }
          style={styles.searchField}
        />
      )}
      i18nTitle={title}>
      {visibleProviders.map(item => {
        if (item.id === ALL_NETWORKS_ID) {
          return (
            <SettingsProvidersAllNetworksRow
              key={item.id}
              providerChainId={initialProviderChainId}
              item={item}
              onPress={onPressProvider}
            />
          );
        }

        return (
          <SettingsProvidersRow
            key={item.id}
            providerChainId={initialProviderChainId}
            item={item}
            onPress={onPressProvider}
          />
        );
      })}
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
