import {Platform} from 'react-native';
import {PlatformOSType} from 'react-native/Libraries/Utilities/Platform';
import {NetworkInfo} from 'react-native-network-info';

import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {Currencies} from '@app/models/currencies';
import {Language} from '@app/models/language';
import {Provider} from '@app/models/provider';
import {VariablesBool} from '@app/models/variables-bool';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {EventTracker} from '@app/services/event-tracker';
import {PushNotifications} from '@app/services/push-notifications';
import {getAppVersion, getBuildNumber} from '@app/services/version';
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
  posthog_id: string | null;
  adjust_id: string | null;
  ip_address: string | null;
  leading_address: string | null;
  notifications: {
    id: string | undefined | null;
    token: string | null;
    transaction: boolean;
    news: boolean;
    raffle: boolean;
  };
  buildNumber: string;
  currency: string | null;
  locale: string;
};

export async function getAppInfo(): Promise<AppInfo> {
  const wallets = Wallet.getAll().map(wallet => wallet.address.toLowerCase());
  const uid = await getUid();
  const posthog_id = await EventTracker.instance.getAdid('posthog');
  const adjust_id = await EventTracker.instance.getAdid('adjust');
  const ipAddress = await NetworkInfo.getIPAddress();
  const leadingAccount = getLeadingAccount();
  const buildNumber = getBuildNumber();
  const currency = Currencies.currency?.id ?? null;
  const locale = Language.current;

  const token = await PushNotifications.instance.getToken();
  return {
    wallets,
    uid,
    chain_id: Provider.selectedProvider.ethChainId.toString(),
    platform: Platform.OS,
    version: getAppVersion(),
    posthog_id,
    adjust_id,
    ip_address: ipAddress,
    leading_address: leadingAccount?.address ?? null,
    notifications: {
      id: VariablesString.get('notificationToken'),
      token,
      transaction: VariablesBool.get(TRANSACTION_TOPIC_VARIABLE_NAME),
      news: VariablesBool.get(NEWS_TOPIC_VARIABLE_NAME),
      raffle: VariablesBool.get(RAFFLE_TOPIC_VARIABLE_NAME),
    },
    buildNumber,
    currency,
    locale,
  };
}
