import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {VoteNamesType} from '@app/types';

export const VOTES: {
  name: VoteNamesType;
  color: Color;
  i18n: I18N;
  value: number;
}[] = [
  {name: 'yes', color: Color.graphicGreen1, i18n: I18N.yes, value: 0x1},
  {name: 'no', color: Color.textRed1, i18n: I18N.no, value: 0x2},
  {
    name: 'abstain',
    color: Color.graphicSecond4,
    i18n: I18N.voteAbstain,
    value: 0x3,
  },
  {
    name: 'no_with_veto',
    color: Color.textYellow1,
    i18n: I18N.voteVeto,
    value: 0x4,
  },
];
