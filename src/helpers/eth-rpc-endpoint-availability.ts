import {RemoteConfig} from '@app/services/remote-config';

import {Initializable} from './initializable';

class EthRpcEndpointAvailabilityHelper extends Initializable {
  async checkEthRpcEndpointAvailability() {
    this.startInitialization();
    await RemoteConfig.awaitForInitialization();
    this.stopInitialization();
  }
}

const instance = new EthRpcEndpointAvailabilityHelper();
export {instance as EthRpcEndpointAvailability};
