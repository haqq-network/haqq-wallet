import React, {useEffect, useMemo, useRef, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {app} from '@app/contexts';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {validatorStatus} from '@app/helpers/validator-status';
import {useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingDelegateAccountScreen} from '@app/screens/staking-delegate-account';
import {StakingDelegateFormScreen} from '@app/screens/staking-delegate-form';
import {Cosmos} from '@app/services/cosmos';
import {RootStackParamList, ScreenOptionType, ValidatorItem} from '@app/types';

const StakingDelegateStack = createStackNavigator();

const screenOptionsSend: ScreenOptionType = {
  ...hideBack,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.stakingDelegateTitle),
};

export const StakingDelegateScreen = () => {
  const wallets = useWallets();
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const route = useRoute<RouteProp<RootStackParamList, 'stakingDelegate'>>();

  const [validator, setValidator] = useState<ValidatorItem | undefined>();

  useEffect(() => {
    cosmos.getValidator(route.params.validator).then(resp => {
      setValidator({
        ...resp.validator,
        localStatus: validatorStatus(resp.validator),
      });
    });
  }, [cosmos, route.params.validator]);

  const account = useMemo(() => {
    return wallets.visible.length === 1 ? wallets.visible[0].address : null;
  }, [wallets.visible]);

  if (!validator) {
    return null;
  }

  return (
    <StakingDelegateStack.Navigator
      screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}
      initialRouteName={
        account ? 'stakingDelegateForm' : 'stakingDelegateAccount'
      }>
      <StakingDelegateStack.Screen
        name="stakingDelegateForm"
        component={StakingDelegateFormScreen}
        initialParams={{validator, account}}
        options={screenOptionsForm}
      />
      <StakingDelegateStack.Screen
        name="stakingDelegateAccount"
        initialParams={{validator}}
        component={StakingDelegateAccountScreen}
        options={screenOptionsSend}
      />
    </StakingDelegateStack.Navigator>
  );
};
