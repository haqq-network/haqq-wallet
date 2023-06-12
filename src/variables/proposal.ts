import {Color} from '@app/colors';
import {IconsName as IconsNameUI} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {ProposalsTagKeys} from '@app/types';

export type ProposalsTagType = [
  ProposalsTagKeys,
  I18N,
  Color | undefined,
  Color,
  IconsNameUI | undefined,
];

export const ProposalsTags: ProposalsTagType[] = [
  [
    '*',
    I18N.homeGovernanceTagAll,
    Color.graphicGreen1,
    Color.textBase3,
    undefined,
  ],
  [
    'PROPOSAL_STATUS_VOTING_PERIOD',
    I18N.homeGovernanceTagVoting,
    Color.graphicGreen1,
    Color.textBase3,
    IconsNameUI.time,
  ],
  [
    'PROPOSAL_STATUS_DEPOSIT_PERIOD',
    I18N.homeGovernanceVotingCardDepositPeriod,
    Color.graphicBlue1,
    Color.textBase3,
    IconsNameUI.deposit,
  ],
  [
    'PROPOSAL_STATUS_PASSED',
    I18N.homeGovernanceTagPassed,
    undefined,
    Color.textGreen1,
    IconsNameUI.check,
  ],
  [
    'PROPOSAL_STATUS_REJECTED',
    I18N.homeGovernanceTagRejected,
    undefined,
    Color.textRed1,
    IconsNameUI.close,
  ],
];
