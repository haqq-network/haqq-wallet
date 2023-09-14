import {Platform} from 'react-native';
import {PlatformOSType} from 'react-native/Libraries/Utilities/Platform';

import {app} from '@app/contexts';
import {getUid} from '@app/helpers/get-uid';
import {getAdjustAdid} from '@app/helpers/get_adjust_adid';
import {Wallet} from '@app/models/wallet';
import {getAppVersion} from '@app/services/version';

export type AppInfo = {
  wallets: string[];
  uid: string;
  chain_id: string;
  platform: PlatformOSType;
  version: string;
  adid: string | null;
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
  };
}
