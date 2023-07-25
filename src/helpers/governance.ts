import {Proposal} from '@evmos/provider/dist/rest/gov';
import {Coin} from '@evmos/transactions';
import {
  differenceInMilliseconds,
  differenceInSeconds,
  getSeconds,
} from 'date-fns';

import {DepositResponse, VotesType} from '@app/types';

/**
 * @deprecated use calculateEstimateTime or useTimer instead
 */
export function dataDifference(item: Proposal) {
  const date = new Date(item.voting_end_time);

  const diff = differenceInSeconds(
    getSeconds(date) > 1 ? date : new Date(item.deposit_end_time ?? ''),
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

/**
 * @deprecated use calculateEstimateTime or useTimer instead
 */
export function dataDifferenceBetweenDates(to: string, from: string) {
  const f = Math.max(new Date(from).getTime(), Date.now());
  const diff = differenceInSeconds(new Date(to), f);

  const daysLeft = Math.floor(diff / 86400);
  const hourLeft = Math.floor(diff / (60 * 60)) - daysLeft * 24;
  const minLeft = Math.floor(diff / 60) - hourLeft * 60 - daysLeft * 24 * 60;

  return {
    daysLeft,
    hourLeft,
    minLeft,
  };
}

export function timeLeftPercent(item: Proposal) {
  const dateStart = new Date(item.voting_start_time);
  const createdAt = getCreatedAt(item);
  const start = dateStart.getTime() > 1000 ? dateStart : createdAt;
  const dateEnd = new Date(item.voting_end_time);
  const depositEnd = new Date(item.deposit_end_time);

  const diff = differenceInMilliseconds(
    dateEnd.getTime() > 1000 ? dateEnd : depositEnd,
    start,
  );
  const timeBeforeEnd = Date.now() - start.getTime();
  const leftPercent = timeBeforeEnd / diff;
  return leftPercent * 100;
}

export function proposalVotes(item: Proposal): VotesType {
  if (item.final_tally_result) {
    let preparedObj: any = {};

    Object.entries(item.final_tally_result).forEach(([key, value]) => {
      preparedObj[key] = parseInt(value, 10) ?? 0;
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

export function getCreatedAt(item: Proposal) {
  if (item.submit_time) {
    return new Date(item.submit_time);
  } else {
    return new Date();
  }
}

export function proposalDepositNeeds(item: Proposal): number {
  return item.total_deposit.reduce(
    (acc: number, coin: Coin) => acc + parseInt(coin.amount, 10),
    0,
  );
}

export function depositSum(response?: DepositResponse) {
  if (!response) {
    return 0;
  }
  return response.deposits.reduce(
    (acc, item) => acc + item.amount.reduce((a, b) => a + +b.amount, 0),
    0,
  );
}

export function yesPercent(item: Proposal) {
  if (item.final_tally_result.yes === '0') {
    return 0;
  }
  const allVotesSum = Object.values(item.final_tally_result).reduce(
    (acc, it) => acc + parseInt(it, 10),
    0,
  );
  return (parseInt(item.final_tally_result.yes, 10) / allVotesSum) * 100;
}
