import React, {memo, useCallback} from 'react';

import {Alert} from 'react-native';

import {SssMigrateRewrite} from '@app/components/sss-migrate-rewrite/sss-migrate-rewrite';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/screens/HomeStack/SssMigrate';

export const SssMigrateRewriteScreen = memo(() => {
  const navigation = useTypedNavigation<SssMigrateStackParamList>();
  const route = useTypedRoute<
    SssMigrateStackParamList,
    SssMigrateStackRoutes.SssMigrateRewrite
  >();

  const onDone = useCallback(() => {
    Alert.alert(
      getText(I18N.sssMigrateRewriteAlertTitle),
      getText(I18N.sssMigrateRewriteAlertDescription),
      [
        {text: 'Cancel'},
        {
          text: 'Accept',
          style: 'destructive',
          onPress() {
            navigation.navigate(SssMigrateStackRoutes.SssMigrateStore, {
              accountId: route.params.accountId,
              privateKey: route.params.privateKey,
              token: route.params.token,
              verifier: route.params.verifier,
            });
          },
        },
      ],
    );
  }, [
    navigation,
    route.params.accountId,
    route.params.privateKey,
    route.params.verifier,
    route.params.token,
  ]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SssMigrateRewrite
      provider={route.params.provider}
      email={route.params.email}
      onDone={onDone}
      onCancel={onCancel}
    />
  );
});
