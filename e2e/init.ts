import 'dotenv/config';
import {checkMilkAddressBalance} from './helpers/checkMilkAddressBalance';

beforeAll(async () => {
  await checkMilkAddressBalance();
});
