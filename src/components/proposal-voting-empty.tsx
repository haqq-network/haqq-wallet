import React from 'react';

import {StyleSheet, View, useWindowDimensions} from 'react-native';

import {Color, getColor} from '@app/colors';
import {NoProposalVotingIcon, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

export const ProposalVotingEmpty = () => {
  const height = useWindowDimensions().height / 1.5;
  return (
    <View style={[styles.container, {height}]}>
      <NoProposalVotingIcon
        color={getColor(Color.graphicSecond3)}
        style={styles.icon}
      />
      <Text t14 color={Color.textSecond1} i18n={I18N.proposalNoVoting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {marginBottom: 12},
});
