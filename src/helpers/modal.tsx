import {app} from '../contexts/app';

export const modal = (modalName: string) => {
  app.emit('modal', {type: modalName});
};

export const hideModal = () => {
  app.emit('modal', null);
};
