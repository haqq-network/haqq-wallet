import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {SettingsProviders} from '@app/components/settings/settings-providers';
import {CustomHeader} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Provider} from '@app/models/provider';
import {ProvidersStackParamList, ProvidersStackRoutes} from '@app/route-types';
import {ChainId} from '@app/types';

export const SettingsProvidersScreen = observer(() => {
  const navigation = useTypedNavigation<ProvidersStackParamList>();
  const providers = Provider.getAll();

  const onSelectProvider = useCallback(
    (chainId: ChainId) => {
      navigation.navigate(ProvidersStackRoutes.SettingsProviderForm, {
        id: chainId,
      });
    },
    [navigation],
  );

  const onPressAdd = useCallback(() => {
    navigation.push(ProvidersStackRoutes.SettingsProviderForm, {});
  }, [navigation]);

  const header = useMemo(() => {
    if (AppStore.isDeveloperModeEnabled) {
      return (
        <CustomHeader
          onPressLeft={navigation.goBack}
          iconLeft="arrow_back"
          title={I18N.settingsProvidersTitle}
          i18nTextRight={I18N.settingsProvidersTitleRight}
          colorRight={Color.textGreen1}
          onPressRight={onPressAdd}
        />
      );
    }

    return (
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsProvidersTitle}
      />
    );
  }, [navigation.goBack, onPressAdd]);

  return (
    <>
      {header}
      <SettingsProviders
        providers={providers}
        providerChainId={Provider.selectedProvider.ethChainId}
        onSelect={onSelectProvider}
      />
    </>
  );
});
