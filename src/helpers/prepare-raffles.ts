import {Raffle} from '@app/types';

export function prepareRaffles(raffles: Raffle[]) {
  return raffles
    .sort((a, b) => b.start_at - a.start_at)
    .filter(item => {
      const closedAt = new Date(item.close_at * 1000);
      const showResult = new Date() > closedAt;
      const notTiketsByUser = !item?.total_tickets;
      if (showResult && notTiketsByUser) {
        return false;
      }
      return true;
    });
}
