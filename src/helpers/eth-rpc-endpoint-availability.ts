import {onCheckAvailability} from '@app/event-actions/on-check-availability';

import {Initializable} from './initializable';

class EthRpcEndpointAvailabilityHelper extends Initializable {
  async checkEthRpcEndpointAvailability() {
    this.startInitialization();
    await onCheckAvailability();
    this.stopInitialization();
  }
}

const instance = new EthRpcEndpointAvailabilityHelper();
export {instance as EthRpcEndpointAvailability};
