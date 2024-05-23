import React, {memo, useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {checkNeedUpdate} from '@app/helpers/check-app-version';

export interface NewsButtonProps {
  focused: boolean;
}

export const SettingsButton = memo(({focused}: NewsButtonProps) => {
  const isUpdateNeeded = useMemo(() => checkNeedUpdate(), []);

  return (
    <View style={page.container}>
      <Icon
        name={IconsName.settings}
        color={focused ? Color.graphicGreen1 : Color.graphicBase2}
      />
      {isUpdateNeeded && <View style={page.hasNews} />}
    </View>
  );
});

const page = createTheme({
  container: {position: 'relative'},
  hasNews: {
    top: -2,
    right: -2,
    position: 'absolute',
    padding: 2,
    borderRadius: 5,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: Color.bg1,
    backgroundColor: Color.graphicGreen1,
  },
});
