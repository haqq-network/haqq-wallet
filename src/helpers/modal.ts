import {app} from '../contexts/app';

type Params = Omit<Record<string, any>, 'type'>;

export const showModal = (modalName: string, params: Params = {}) => {
  app.emit('modal', {type: modalName, ...params});
};

export const hideModal = (modalName: String | null = null) => {
  app.emit('hideModal', {type: modalName});
};
