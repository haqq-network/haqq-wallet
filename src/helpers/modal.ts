import {app} from '@app/contexts/app';

type Params = Omit<Record<string, any>, 'type'>;

export function showModal(modalName: string, params: Params = {}) {
  app.emit('modal', {type: modalName, ...params});
}

export function hideModal(modalName: String | null = null) {
  app.emit('hideModal', {type: modalName});
}
