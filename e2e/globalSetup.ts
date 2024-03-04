import {checkMilkAddressBalance} from './helpers/checkMilkAddressBalance';
import {MilkAddressProxy} from './helpers/milkAddressProxy';

module.exports = async function () {
  await require('detox/runners/jest/index').globalSetup();
  await checkMilkAddressBalance();
  await MilkAddressProxy.initialize();
};
