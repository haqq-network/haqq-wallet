import React, {useCallback, useEffect} from 'react';

import {BottomSheet} from '@app/components/bottom-sheet';
import {Spacer} from '@app/components/ui';
import {hideModal} from '@app/helpers';
import {AwaitProviderParams} from '@app/helpers/await-for-provider';
import {useApp} from '@app/hooks';

import {SettingsProvidersRow} from '../settings-providers/settings-providers-row';

export type ProvidersBottomSheetProps = AwaitProviderParams & {
  closeDistance?: number;
  eventSuffix?: string;
};

export function ProvidersBottomSheet({
  title,
  providers,
  initialProviderId: initialProvider,
  closeDistance,
  eventSuffix = '',
}: ProvidersBottomSheetProps) {
  const app = useApp();

  const onPressProvider = useCallback(
    (providerId: string) => {
      hideModal();
      app.emit(`provider-selected${eventSuffix}`, providerId);
    },
    [app, eventSuffix],
  );

  const onClose = () => {
    app.emit(`provider-selected-reject${eventSuffix}`);
    hideModal();
  };

  useEffect(() => {
    return () => {
      app.emit(`provider-selected-reject${eventSuffix}`);
    };
  }, [onPressProvider, app, eventSuffix]);

  return (
    <BottomSheet
      onClose={onClose}
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
