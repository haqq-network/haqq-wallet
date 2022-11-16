import {
  generateEndpointDistributionRewardsByAddress,
  generateEndpointGetDelegations,
  generateEndpointGetUndelegations,
} from '@evmos/provider';
import converter from 'bech32-converting';

import {Provider} from '@app/models/provider';

export class Cosmos {
  private _provider: Provider;

  static address(address: string) {
    return converter('haqq').toBech32(address);
  }

  constructor(provider: Provider) {
    this._provider = provider;
  }

  async getAccountDelegations(address: string) {
    console.log('getAccountDelegations 1');
    const delegations = await fetch(
      `${this._provider.cosmosRestEndpoint}/${generateEndpointGetDelegations(
        address,
      )}`,
    );
    console.log(delegations);
    return await delegations.json();
  }

  async getRewardsInfo(address: string) {
    const info = await fetch(
      `${
        this._provider.cosmosRestEndpoint
      }/${generateEndpointDistributionRewardsByAddress(address)}`,
    );

    return await info.json();
  }

  async getUnDelegations(address: string) {
    const unDelegationsResponse = await fetch(
      `${this._provider.cosmosRestEndpoint}/${generateEndpointGetUndelegations(
        address,
      )}`,
    );
    const unDelegations = await unDelegationsResponse.json();

    return unDelegations.unbonding_responses;
  }
}
