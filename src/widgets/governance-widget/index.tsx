import React, {memo, useCallback} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {GovernanceWidget} from '@app/widgets/governance-widget/governance-widget';

export const GovernanceWidgetWrapper = memo(function GovernanceWidgetWrapper() {
  const navigation = useTypedNavigation();
  const onPress = useCallback(() => {
    navigation.navigate('governance');
  }, [navigation]);
  return <GovernanceWidget onPress={onPress} />;
});
