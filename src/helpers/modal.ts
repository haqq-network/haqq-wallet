import {app} from '@app/contexts/app';
import {I18N, getText} from '@app/i18n';

type Params = Omit<Record<string, any>, 'type'>;

export function showModal(modalName: string, params: Params = {}) {
  app.emit('modal', {type: modalName, ...params});
}

export function hideModal(modalName: String | null = null) {
  app.emit('hideModal', {type: modalName});
}

export function sendNotification(text: I18N) {
  app.emit('notification', getText(text));
}
