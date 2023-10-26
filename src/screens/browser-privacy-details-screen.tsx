import React, {useCallback} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';

import {BrowserPrivacyDetails} from '@app/components/browser-privacy-details';
import {awaitForValue, objectsToValues} from '@app/helpers/await-for-value';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {BrowserPermission} from '@app/models/browser-permission';
import {BrowserPermissionStatus, BrowserPermissionType} from '@app/types';
import {uppercaseFirtsLetter} from '@app/utils';

const POSSIBLE_ANSWERS = [
  I18N.browserSecurityAllow,
  I18N.browserSecurityAllowOnce,
  I18N.browserSecurityDeny,
];

export const STATUS_ANSWER_MAP = {
  [BrowserPermissionStatus.allow]: I18N.browserSecurityAllow,
  [BrowserPermissionStatus.allowOnce]: I18N.browserSecurityAllowOnce,
  [BrowserPermissionStatus.deny]: I18N.browserSecurityDeny,
};

const POSSIBLE_ANSWERS_VALUES = objectsToValues(
  POSSIBLE_ANSWERS.map(i18n => ({
    title: getText(i18n),
    // find status by i18n key in STATUS_ANSWER_MAP
    status: Object.entries(STATUS_ANSWER_MAP).find(
      ([_, value]) => value === i18n,
    )?.[0] as BrowserPermissionStatus,
  })),
);

const getInitialIndex = (status: BrowserPermissionStatus) => {
  const answer = STATUS_ANSWER_MAP[status];
  return POSSIBLE_ANSWERS.indexOf(answer);
};

export const BrowserPrivacyDetailsScreen = observer(() => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'browserPrivacyDetails'>();
  const permissions = BrowserPermission.getByHostname(params.hostname);

  const onPermissionPress = useCallback(
    async (type: BrowserPermissionType) => {
      const permissionStatus = permissions[type]?.status;

      const title = uppercaseFirtsLetter(type);

      const result = await awaitForValue({
        title: title,
        values: POSSIBLE_ANSWERS_VALUES,
        initialIndex: getInitialIndex(permissionStatus),
      });

      if (result) {
        BrowserPermission.update(params.hostname, {
          type,
          status: result.status,
        });
      }
    },
    [navigation, permissions],
  );

  useFocusEffect(() => {
    navigation.setOptions({
      title: params?.hostname,
    });
  });

  return (
    <BrowserPrivacyDetails
      permissions={permissions}
      onPermissionPress={onPermissionPress}
    />
  );
});
