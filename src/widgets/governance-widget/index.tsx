import React, {memo, useCallback} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {GovernanceWidget} from '@app/widgets/governance-widget/governance-widget';

const GovernanceWidgetWrapper = memo(() => {
  const navigation = useTypedNavigation();
  const onPress = useCallback(() => {
    navigation.navigate('governance');
  }, [navigation]);
  return <GovernanceWidget onPress={onPress} />;
});

export {GovernanceWidgetWrapper};
