import {Coin} from '@evmos/transactions';
import createHash from 'create-hash';
import {differenceInSeconds, secondsToHours, secondsToMinutes} from 'date-fns';

import {I18N} from '@app/i18n';
import {realm} from '@app/models/index';
import {votesType} from '@app/types';

export const GovernanceVotingState = {
  passed: I18N.homeGovernanceTagPassed,
  rejected: I18N.homeGovernanceTagRejected,
  voting: I18N.homeGovernanceTagVoting,
  deposit: I18N.homeGovernanceVotingCardDepositPeriod,
};

export type GovernanceVotingType = {
  status: string;
  orderNumber: number;
  title: string;
  description: string;
  endDate: string;
  startDate: string;
  votes?: string;
  depositNeeds?: string;
  depositEndTime?: string;
};

export class GovernanceVoting extends Realm.Object {
  hash!: string;
  status!: string;
  orderNumber!: number;
  title!: string;
  description!: string;
  private endDate!: string;
  private startDate!: string;
  private votes?: string;
  private depositNeeds?: string;
  depositEndTime?: string;

  static schema = {
    name: 'GovernanceVoting',
    properties: {
      hash: 'string',
      status: 'string',
      orderNumber: 'int',
      title: 'string',
      description: 'string',
      endDate: 'string',
      startDate: 'string',
      votes: 'string?',
      depositNeeds: 'string?',
      depositEndTime: 'string?',
    },
    primaryKey: 'hash',
  };

  static remove(hash: string) {
    const obj = realm.objectForPrimaryKey<GovernanceVoting>(
      GovernanceVoting.schema.name,
      hash,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static createVoting(proposal: GovernanceVotingType) {
    const hash = createHash('sha1')
      .update(`${proposal.orderNumber}:${proposal.startDate}`)
      .digest()
      .toString('hex');

    realm.write(() => {
      realm.create<GovernanceVoting>(
        GovernanceVoting.schema.name,
        {...proposal, hash},
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  get isVoted() {
    return false;
  }

  get dateEnd() {
    return new Date(this.endDate);
  }

  get dateStart() {
    return new Date(this.startDate);
  }

  get dataDifference() {
    const diff = differenceInSeconds(
      new Date(this.endDate),
      new Date(Date.now()),
    );
    return {
      daysLeft: secondsToHours(diff) / 24,
      hourLeft: secondsToHours(diff),
      minLeft: secondsToMinutes(diff),
      isActive: diff > 0,
    };
  }

  get proposalVotes(): votesType {
    if (this.votes) {
      return JSON.parse(this.votes);
    } else {
      return {
        yes: 1,
        no: 1,
        veto: 1,
        abstain: 1,
      };
    }
  }

  get proposalDepositNeeds(): number | undefined {
    if (this.depositNeeds) {
      return JSON.parse(this.depositNeeds).reduce(
        (acc: number, item: Coin) => acc + item.amount,
        0,
      );
    } else {
      return;
    }
  }

  static getByHash(hash: string) {
    return realm.objectForPrimaryKey<GovernanceVoting>(
      GovernanceVoting.schema.name,
      hash,
    );
  }

  static getAll() {
    return realm.objects<GovernanceVoting>(GovernanceVoting.schema.name);
  }
}
