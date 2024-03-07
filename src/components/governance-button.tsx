import React, {useCallback} from 'react';

import {Icon, IconButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {Color} from '@app/theme';

export const GovernanceButton = () => {
  const navigation = useTypedNavigation<HomeFeedStackParamList>();

  const onPressNews = useCallback(() => {
    navigation.navigate(HomeFeedStackRoutes.Governance);
  }, [navigation]);

  return (
    <IconButton onPress={onPressNews} style={page.container}>
      <Icon name="governance" color={Color.graphicBase1} />
    </IconButton>
  );
};

const page = createTheme({
  container: {marginLeft: 12, position: 'relative'},
});
