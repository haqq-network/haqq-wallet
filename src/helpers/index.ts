import {Dimensions} from 'react-native';

export * from './capture-exception';
export * from './screen-options';
export * from './calc-fee';
export * from './create-theme';
export * from './modal';
export * from './run-until';
export * from './scaling-utils';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;
export const ratio = windowWidth / 541;
