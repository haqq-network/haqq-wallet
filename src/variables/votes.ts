import {Color} from '@app/colors';
import {I18N} from '@app/i18n';
import {VoteNamesType} from '@app/types';

export const VOTES: {name: VoteNamesType; color: Color; i18n: I18N}[] = [
  {name: 'yes', color: Color.graphicGreen1, i18n: I18N.yes},
  {name: 'no', color: Color.textRed1, i18n: I18N.no},
  {name: 'abstain', color: Color.graphicSecond4, i18n: I18N.voteAbstain},
  {name: 'veto', color: Color.textYellow1, i18n: I18N.voteVeto},
];
