import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {BrowserPrivacy} from '@app/components/browser-privacy';
import {useTypedNavigation} from '@app/hooks';
import {BrowserPermission} from '@app/models/browser-permission';
import {Link} from '@app/types';

export const BrowserPrivacyScreen = observer(() => {
  const navigation = useTypedNavigation();
  const permissionMap = BrowserPermission.getAllAsTuple();

  const onLinkPress = useCallback(
    (link: Link) => {
      navigation.navigate('browserPrivacyPopupStack', {
        screen: 'browserPrivacyDetails',
        params: {hostname: link.id},
      });
    },
    [navigation],
  );

  return (
    <BrowserPrivacy permissionMap={permissionMap} onLinkPress={onLinkPress} />
  );
});
