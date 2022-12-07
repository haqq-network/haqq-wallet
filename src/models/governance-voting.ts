import {Coin} from '@evmos/transactions';
import createHash from 'create-hash';

import {I18N} from '@app/i18n';
import {realm} from '@app/models/index';
import {votesType} from '@app/types';

export const GovernanceVotingState = {
  passed: I18N.homeGovernanceTagPassed,
  rejected: I18N.homeGovernanceTagRejected,
  voting: I18N.homeGovernanceTagVoting,
  deposit: I18N.homeGovernanceVotingCardDepositPeriod,
};

type GovernanceVotingType = {
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
  endDate!: string;
  startDate!: string;
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
    const hash = createHash('sha1').digest().toString('hex');

    realm.write(() => {
      realm.create<GovernanceVoting>(
        GovernanceVoting.schema.name,
        {...proposal, hash},
        Realm.UpdateMode.Modified,
      );
    });

    return hash;
  }

  get proposalVotes(): votesType | undefined {
    if (this.votes) {
      return JSON.parse(this.votes);
    } else {
      return;
    }
  }

  get proposalDepositNeeds(): Coin[] | undefined {
    if (this.depositNeeds) {
      return JSON.parse(this.depositNeeds);
    } else {
      return;
    }
  }

  static getAll() {
    return realm.objects<GovernanceVoting>(GovernanceVoting.schema.name);
  }
}
