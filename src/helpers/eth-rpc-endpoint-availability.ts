import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {RemoteConfig} from '@app/services/remote-config';

import {Initializable} from './initializable';

class EthRpcEndpointAvailabilityHelper extends Initializable {
  async checkEthRpcEndpointAvailability() {
    this.startInitialization();
    await RemoteConfig.awaitForInitialization();
    await onCheckAvailability();
    this.stopInitialization();
  }
}

const instance = new EthRpcEndpointAvailabilityHelper();
export {instance as EthRpcEndpointAvailability};
