import React, {useCallback, useEffect} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer} from '@app/components/ui';
import {app} from '@app/contexts';
import {useCalculatedDimensionsValue} from '@app/hooks/use-calculated-dimensions-value';
import {ModalType, Modals} from '@app/types';

import {SettingsProvidersRow} from '../settings/settings-providers/settings-providers-row';

export function ProvidersBottomSheet({
  title,
  providers,
  initialProviderId: initialProvider,
  closeDistance,
  eventSuffix = '',
  onClose,
}: Modals[ModalType.providersBottomSheet]) {
  const closeDistanceCalculated = useCalculatedDimensionsValue(
    () => closeDistance?.(),
    [closeDistance],
  );
  const onPressProvider = useCallback(
    (providerId: string) => {
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

  return (
    <BottomSheet
      onClose={onCloseModal}
      closeDistance={closeDistanceCalculated}
      i18nTitle={title}>
      {providers.map((item, id) => (
        <SettingsProvidersRow
          providerId={initialProvider}
          key={id}
          item={item}
          onPress={onPressProvider}
        />
      ))}
      <Spacer height={50} />
    </BottomSheet>
  );
}
