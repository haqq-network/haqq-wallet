import React from 'react';

import {StyleSheet} from 'react-native';

import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';

type Props = {
  onPress: () => void;
};

const GovernanceWidget = ({onPress}: Props) => {
  return (
    <ShadowCard onPress={onPress} style={styles.wrapper}>
      <WidgetHeader
        icon={'governance'}
        title={getText(I18N.homeGovernance)}
        description={'Voting for changes in the network'}
      />
    </ShadowCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 16},
});

export {GovernanceWidget};
