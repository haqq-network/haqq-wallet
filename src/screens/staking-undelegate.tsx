import React, {useEffect, useMemo, useRef, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {validatorStatus} from '@app/helpers/validator-status';
import {useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {StakingMetadata} from '@app/models/staking-metadata';
import {StakingUnDelegateAccountScreen} from '@app/screens/staking-undelegate-account';
import {StakingUnDelegateFinishScreen} from '@app/screens/staking-undelegate-finish';
import {StakingUnDelegateFormScreen} from '@app/screens/staking-undelegate-form';
import {StakingUnDelegatePreviewScreen} from '@app/screens/staking-undelegate-preview';
import {Cosmos} from '@app/services/cosmos';
import {RootStackParamList, ScreenOptionType, ValidatorItem} from '@app/types';

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
  const route = useRoute<RouteProp<RootStackParamList, 'stakingUnDelegate'>>();
  const [validator, setValidator] = useState<ValidatorItem | undefined>();

  useEffect(() => {
    cosmos.getValidator(route.params.validator).then(resp => {
      setValidator({
        ...resp.validator,
        localStatus: validatorStatus(resp.validator),
      });
    });
  }, [cosmos, route.params.validator]);

  const available = useMemo(() => {
    const delegations = new Set(
      StakingMetadata.getDelegationsForValidator(route.params.validator).map(
        v => v.delegator,
      ),
    );

    return wallets.visible.filter(w => delegations.has(w.cosmosAddress));
  }, [route.params.validator, wallets.visible]);

  const account = useMemo(() => {
    return available.length === 1 ? available[0].address : null;
  }, [available]);

  console.log('validator', validator);
  console.log('available', available);
  console.log('account', account);

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
