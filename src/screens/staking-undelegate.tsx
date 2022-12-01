import React, {useEffect, useMemo, useRef, useState} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {validatorStatus} from '@app/helpers/validator-status';
import {useTypedRoute, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {StakingUnDelegateAccountScreen} from '@app/screens/staking-undelegate-account';
import {StakingUnDelegateFinishScreen} from '@app/screens/staking-undelegate-finish';
import {StakingUnDelegateFormScreen} from '@app/screens/staking-undelegate-form';
import {StakingUnDelegatePreviewScreen} from '@app/screens/staking-undelegate-preview';
import {Cosmos} from '@app/services/cosmos';
import {ScreenOptionType, ValidatorItem} from '@app/types';

const StakingUnDelegateStack = createStackNavigator();

const screenOptionsAccount: ScreenOptionType = {
  title: getText(I18N.stakingUnDelegateAccountTitle),
  ...hideBack,
};

const screenOptionsPreview: ScreenOptionType = {
  title: getText(I18N.stakingUnDelegatePreviewTitle),
  ...hideBack,
};

const screenOptionsForm: ScreenOptionType = {
  ...hideBack,
  title: getText(I18N.stakingUnDelegateFormTitle),
};

export const StakingUnDelegateScreen = () => {
  const wallets = useWallets();
  const cosmos = useRef(new Cosmos(app.provider!)).current;
  const {validator: paramValidator} =
    useTypedRoute<'stakingUnDelegate'>().params;
  const [validator, setValidator] = useState<ValidatorItem | undefined>();

  useEffect(() => {
    cosmos.getValidator(paramValidator).then(resp => {
      setValidator({
        ...resp.validator,
        localStatus: validatorStatus(resp.validator),
      });
    });
  }, [cosmos, paramValidator]);

  const available = useMemo(() => {
    const delegations = new Set(
      StakingMetadata.getDelegationsForValidator(paramValidator).map(
        v => v.delegator,
      ),
    );

    return wallets.visible.filter(w => delegations.has(w.cosmosAddress));
  }, [paramValidator, wallets.visible]);

  const account = useMemo(() => {
    return available.length === 1 ? available[0].address : null;
  }, [available]);

  if (!(validator && available.length)) {
    return <Loading />;
  }

  return (
    <StakingUnDelegateStack.Navigator
      screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}
      initialRouteName={
        account ? 'stakingUnDelegateForm' : 'stakingUnDelegateAccount'
      }>
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegateForm"
        component={StakingUnDelegateFormScreen}
        initialParams={{validator, account}}
        options={screenOptionsForm}
      />
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegateAccount"
        initialParams={{validator, available}}
        component={StakingUnDelegateAccountScreen}
        options={screenOptionsAccount}
      />
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegatePreview"
        initialParams={{validator}}
        component={StakingUnDelegatePreviewScreen}
        options={screenOptionsPreview}
      />
      <StakingUnDelegateStack.Screen
        name="stakingUnDelegateFinish"
        initialParams={{validator}}
        component={StakingUnDelegateFinishScreen}
        options={hideBack}
      />
    </StakingUnDelegateStack.Navigator>
  );
};
