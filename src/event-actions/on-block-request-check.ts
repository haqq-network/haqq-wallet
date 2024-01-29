import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {getUid} from '@app/helpers/get-uid';
import {I18N, getText} from '@app/i18n';
import {VariableString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';

export async function onBlockRequestCheck() {
  const blockRequest = VariableString.get('block_code');
  // Logger.log('onBlockRequestCheck', {blockRequest});

  try {
    if (blockRequest) {
      const uid = await getUid();
      const response = await Backend.instance.blockRequest(
        blockRequest,
        Wallet.addressList(),
        uid,
      );

      if (response.result) {
        VariableString.remove('block_code');
        app.emit(Events.onRequestMarkup, blockRequest);
      } else if (response.error) {
        Logger.error('onBlockRequest request error', response);
        showModal('error', {
          title: getText(I18N.blockRequestErrorTitle),
          description: response.error,
          close: getText(I18N.blockRequestOk),
        });
      }
    }
  } catch (err) {
    Logger.captureException(err, 'onBlockRequest', {blockRequest});
  }
}
