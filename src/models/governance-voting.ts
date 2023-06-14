import {Coin} from '@evmos/transactions';
import {
  differenceInMilliseconds,
  differenceInSeconds,
  getSeconds,
} from 'date-fns';

import {I18N} from '@app/i18n';
import {DepositResponse, VotesType} from '@app/types';

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
  createdAtTime?: string;
};

export class GovernanceVoting extends Realm.Object {
  static schema = {
    name: 'GovernanceVoting',
    properties: {
      status: 'string',
      orderNumber: 'int',
      title: 'string',
      description: 'string',
      endDate: 'string',
      startDate: 'string',
      votes: 'string?',
      depositNeeds: 'string?',
      depositEndTime: 'string?',
      createdAtTime: 'string?',
      changes: 'string?',
      type: 'string?',
      plan: 'string?',
      deposit: {type: 'string', default: '0'},
    },
    primaryKey: 'orderNumber',
  };
  status!: string;
  orderNumber!: number;
  title!: string;
  description!: string;
  changes!: string;
  plan!: string;
  type!: string;
  deposit!: string;
  private endDate!: string;
  private startDate!: string;
  private votes?: string;
  private depositNeeds?: string;
  private depositEndTime?: string;
  private createdAtTime?: string;

  get timeLeftPercent() {
    const start =
      this.dateStart.getTime() > 1000 ? this.dateStart : this.createdAt;
    const diff = differenceInMilliseconds(
      this.dateEnd.getTime() > 1000 ? this.dateEnd : this.depositEnd,
      start,
    );
    const timeBeforeEnd = Date.now() - start.getTime();
    const leftPercent = timeBeforeEnd / diff;
    return leftPercent * 100;
  }

  get isDeposited() {
    return this.status === 'deposited';
  }

  get isVoting() {
    return this.status === 'voting';
  }

  get isVoted() {
    return false;
  }

  get depositEnd() {
    if (this.depositEndTime) {
      return new Date(this.depositEndTime);
    } else {
      return new Date();
    }
  }

  get createdAt() {
    if (this.createdAtTime) {
      return new Date(this.createdAtTime);
    } else {
      return new Date();
    }
  }

  get dateEnd() {
    return new Date(this.endDate);
  }

  get dateStart() {
    return new Date(this.startDate);
  }

  get dataDifference() {
    const date = new Date(this.endDate);

    const diff = differenceInSeconds(
      getSeconds(date) > 1 ? date : new Date(this.depositEndTime ?? ''),
      new Date(Date.now()),
    );

    const daysLeft = Math.floor(diff / 86400);
    const hourLeft = Math.floor(diff / (60 * 60)) - daysLeft * 24;
    const minLeft = Math.floor(diff / 60) - hourLeft * 60 - daysLeft * 24 * 60;

    return {
      daysLeft,
      hourLeft,
      minLeft,
    };
  }

  get isActive() {
    return this.status === 'voting' || this.status === 'deposited';
  }

  get yesPercent() {
    const allVotes = this.proposalVotes;
    const allVotesSum = Object.values(allVotes).reduce(
      (acc: number, item: number) => acc + item,
      0,
    );
    return (allVotes.yes / allVotesSum) * 100;
  }

  get proposalVotes(): VotesType {
    if (this.votes) {
      const rawObj = JSON.parse(this.votes);
      let preparedObj: any = {};
      Object.keys(rawObj).forEach(key => {
        preparedObj[key] = isNaN(rawObj[key]) ? 0 : rawObj[key];
      });
      return preparedObj;
    } else {
      return {
        yes: 1,
        no: 1,
        no_with_veto: 1,
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

  static depositSum(response?: DepositResponse) {
    if (!response) {
      return 0;
    }
    return response.deposits.reduce(
      (acc, item) => acc + item.amount.reduce((a, b) => a + +b.amount, 0),
      0,
    );
  }
}
