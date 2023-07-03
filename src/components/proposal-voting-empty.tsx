import React from 'react';

import {StyleSheet, View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

interface ProposalVotingEmptyProps {
  votingCategory: string;
}

export const ProposalVotingEmpty = ({
  votingCategory,
}: ProposalVotingEmptyProps) => {
  const height = useWindowDimensions().height / 1.5;

  switch (votingCategory) {
    case 'PROPOSAL_STATUS_VOTING_PERIOD':
      votingCategory = 'voting';
      break;
    case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
      votingCategory = 'deposit';
      break;
    case 'PROPOSAL_STATUS_PASSED':
      votingCategory = 'passed';
      break;
    case 'PROPOSAL_STATUS_REJECTED':
      votingCategory = 'rejected';
      break;
    case 'PROPOSAL_STATUS_FAILED':
      votingCategory = 'failed';
      break;
    case 'PROPOSAL_STATUS_UNSPECIFIED':
      votingCategory = 'unspecified';
      break;
    default:
      votingCategory = '';
  }

  return (
    <View style={[styles.container, {height}]}>
      <Icon
        i80
        name="no_proposal_voting"
        color={Color.graphicSecond3}
        style={styles.icon}
      />
      <Text
        t8
        color={Color.textSecond1}
        i18params={{votingCategory}}
        i18n={I18N.proposalNoVoting}
      />
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
