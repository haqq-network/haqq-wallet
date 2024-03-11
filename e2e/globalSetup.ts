import {checkMilkAddressBalance} from './helpers/checkMilkAddressBalance';
import {MilkAddressProxy} from './helpers/milkAddressProxy';

module.exports = async function () {
  await checkMilkAddressBalance();
  await MilkAddressProxy.initialize();
  await require('detox/runners/jest/index').globalSetup();
};
