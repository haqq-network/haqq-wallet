import {MilkAddressProxy} from './helpers/milkAddressProxy';

module.exports = async function () {
  try {
    await MilkAddressProxy.destroy();
  } finally {
    await require('detox/runners/jest/index').globalTeardown();
  }
};
