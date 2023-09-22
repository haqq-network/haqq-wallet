import {Platform} from 'react-native';
import {PlatformOSType} from 'react-native/Libraries/Utilities/Platform';

import {app} from '@app/contexts';
import {getUid} from '@app/helpers/get-uid';
import {getAdjustAdid} from '@app/helpers/get_adjust_adid';
import {VariablesBool} from '@app/models/variables-bool';
import {Wallet} from '@app/models/wallet';
import {getAppVersion} from '@app/services/version';
import {
  NEWS_TOPIC_VARIABLE_NAME,
  RAFFLE_TOPIC_VARIABLE_NAME,
  TRANSACTION_TOPIC_VARIABLE_NAME,
} from '@app/variables/common';

export type AppInfo = {
  wallets: string[];
  uid: string;
  chain_id: string;
  platform: PlatformOSType;
  version: string;
  adid: string | null;
  notifications: {
    transaction: boolean;
    news: boolean;
    raffle: boolean;
  };
};

export async function getAppInfo(): Promise<AppInfo> {
  const wallets = Wallet.getAll().map(wallet => wallet.address.toLowerCase());
  const uid = await getUid();
  const adid = await getAdjustAdid();
  return {
    wallets,
    uid,
    chain_id: app.provider.cosmosChainId,
    platform: Platform.OS,
    version: getAppVersion(),
    adid,
    notifications: {
      transaction: VariablesBool.get(TRANSACTION_TOPIC_VARIABLE_NAME),
      news: VariablesBool.get(NEWS_TOPIC_VARIABLE_NAME),
      raffle: VariablesBool.get(RAFFLE_TOPIC_VARIABLE_NAME),
    },
  };
}
