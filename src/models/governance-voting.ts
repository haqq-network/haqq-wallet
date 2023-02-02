import {Proposal} from '@evmos/provider/dist/rest/gov';
import {Coin} from '@evmos/transactions';
import {
  differenceInMilliseconds,
  differenceInSeconds,
  getSeconds,
} from 'date-fns';

import {I18N} from '@app/i18n';
import {realm} from '@app/models/index';
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
    },
    primaryKey: 'orderNumber',
  };
  status!: string;
  orderNumber!: number;
  title!: string;
  description!: string;
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

  static depositSum(response?: DepositResponse) {
    if (!response) {
      return 0;
    }
    return response.deposits.reduce(
      (acc, item) => acc + item.amount.reduce((a, b) => a + +b.amount, 0),
      0,
    );
  }

  // async getDepositor(address: string) {
  //   try {
  //     const cosmos = new Cosmos(app.provider!);
  //     const details = await cosmos.getProposalDepositor(
  //       this.orderNumber,
  //       address,
  //     );
  //     return details;
  //   } catch (error) {
  //     captureException(error);
  //     return [];
  //   }
  // }

  static getById(id: number) {
    return realm.objectForPrimaryKey<GovernanceVoting>(
      GovernanceVoting.schema.name,
      id,
    );
  }

  static keyFromStatus(status: string) {
    return (
      {
        proposal_status_voting_period: 'voting',
        proposal_status_deposit_period: 'deposited',
        proposal_status_passed: 'passed',
        proposal_status_rejected: 'rejected',
      }[status] ?? ''
    );
  }

  static remove(id: number) {
    const obj = realm.objectForPrimaryKey<GovernanceVoting>(
      GovernanceVoting.schema.name,
      id,
    );

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static create(proposal: Proposal) {
    const {no_with_veto: veto, ...copy}: any = proposal.final_tally_result;
    delete copy.no_with_veto;
    const votes: any = {};

    Object.entries({...copy, veto}).map(([key, val]) => {
      votes[key] = Math.round(Number(val));
    });

    realm.write(() => {
      realm.create(
        GovernanceVoting.schema.name,
        {
          status: GovernanceVoting.keyFromStatus(proposal.status.toLowerCase()),
          endDate: proposal.voting_end_time,
          startDate: proposal.voting_start_time,
          depositNeeds: JSON.stringify(proposal.total_deposit),
          depositEndTime: proposal.deposit_end_time,
          createdAtTime: proposal.submit_time,
          orderNumber: Number(proposal.proposal_id),
          description: proposal.content.description,
          title: proposal.content.title,
          votes: JSON.stringify(votes),
        },
        Realm.UpdateMode.Modified,
      );
    });

    return Number(proposal.proposal_id);
  }

  static getAll() {
    return realm.objects<GovernanceVoting>(GovernanceVoting.schema.name);
  }
}

export type ProposalRealmType = GovernanceVoting & Realm.Object<unknown, never>;

export type ProposalsRealmType = Realm.Results<ProposalRealmType>;

export type ProposalRealmSubType = Realm.CollectionChangeCallback<
  GovernanceVoting & Realm.Object<unknown, never>
>;
