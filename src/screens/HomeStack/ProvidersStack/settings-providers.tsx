import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {Color} from '@app/colors';
import {SettingsProviders} from '@app/components/settings/settings-providers';
import {CustomHeader} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {ProvidersStackParamList, ProvidersStackRoutes} from '@app/route-types';

export const SettingsProvidersScreen = observer(() => {
  const navigation = useTypedNavigation<ProvidersStackParamList>();
  const providers = Provider.getAll();

  const onSelectProvider = useCallback(
    (pid: string) => {
      navigation.navigate(ProvidersStackRoutes.SettingsProviderForm, {
        id: pid,
      });
    },
    [navigation],
  );

  const onPressAdd = useCallback(() => {
    navigation.push(ProvidersStackRoutes.SettingsProviderForm, {});
  }, [navigation]);

  const header = useMemo(() => {
    if (app.isDeveloper) {
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
        providerId={Provider.selectedProviderId}
        onSelect={onSelectProvider}
      />
    </>
  );
});
