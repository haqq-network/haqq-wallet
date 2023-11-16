import {Platform} from 'react-native';
import {PlatformOSType} from 'react-native/Libraries/Utilities/Platform';
import {NetworkInfo} from 'react-native-network-info';

import {app} from '@app/contexts';
import {getUid} from '@app/helpers/get-uid';
import {getAdjustAdid} from '@app/helpers/get_adjust_adid';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {PushNotifications} from '@app/services/push-notifications';
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
  ip_address: string | null;
  notifications: {
    id: string | undefined | null;
    token: string | null;
    transaction: boolean;
    news: boolean;
    raffle: boolean;
  };
};

export async function getAppInfo(): Promise<AppInfo> {
  const wallets = Wallet.getAll().map(wallet => wallet.address.toLowerCase());
  const uid = await getUid();
  const adid = await getAdjustAdid();
  const ipAddress = await NetworkInfo.getIPAddress();

  const token = await PushNotifications.instance.getToken();
  return {
    wallets,
    uid,
    chain_id: app.provider.cosmosChainId,
    platform: Platform.OS,
    version: getAppVersion(),
    adid,
    ip_address: ipAddress,
    notifications: {
      id: VariablesString.get('notificationToken'),
      token,
      transaction: VariablesBool.get(TRANSACTION_TOPIC_VARIABLE_NAME),
      news: VariablesBool.get(NEWS_TOPIC_VARIABLE_NAME),
      raffle: VariablesBool.get(RAFFLE_TOPIC_VARIABLE_NAME),
    },
  };
}
