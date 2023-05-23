import React, {useCallback, useEffect} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer} from '@app/components/ui';
import {useApp} from '@app/hooks';
import {Modals} from '@app/types';

import {SettingsProvidersRow} from '../settings-providers/settings-providers-row';

export function ProvidersBottomSheet({
  title,
  providers,
  initialProviderId: initialProvider,
  closeDistance,
  eventSuffix = '',
  onClose,
}: Modals['providersBottomSheet']) {
  const app = useApp();

  const onPressProvider = useCallback(
    (providerId: string) => {
      onClose?.();
      app.emit(`provider-selected${eventSuffix}`, providerId);
    },
    [app, eventSuffix, onClose],
  );

  const onCloseModal = () => {
    app.emit(`provider-selected-reject${eventSuffix}`);
    onClose?.();
  };

  useEffect(() => {
    return () => {
      app.emit(`provider-selected-reject${eventSuffix}`);
    };
  }, [onPressProvider, app, eventSuffix]);

  return (
    <BottomSheet
      onClose={onCloseModal}
      closeDistance={closeDistance}
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
