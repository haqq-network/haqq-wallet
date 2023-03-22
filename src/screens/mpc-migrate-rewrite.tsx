import React, {useCallback} from 'react';

import {Alert} from 'react-native';

import {MpcMigrateRewrite} from '@app/components/mpc-migrate-rewrite/mpc-migrate-rewrite';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

export const MpcMigrateRewriteScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'mpcMigrateRewrite'>();

  const onDone = useCallback(() => {
    Alert.alert(
      getText(I18N.mpcMigrateRewriteAlertTitle),
      getText(I18N.mpcMigrateRewriteAlertDescription),
      [
        {text: 'Cancel'},
        {
          text: 'Accept',
          style: 'destructive',
          onPress() {
            navigation.navigate('mpcMigrateStore', {
              accountId: route.params.accountId,
              privateKey: route.params.privateKey,
            });
          },
        },
      ],
    );
  }, [navigation, route.params.accountId, route.params.privateKey]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <MpcMigrateRewrite
      provider={route.params.provider}
      email={route.params.email}
      onDone={onDone}
      onCancel={onCancel}
    />
  );
};
