import Config from 'react-native-config';
import {LoggerService} from '@app/services/logger';

global.Logger = new LoggerService();
global.IS_DETOX =
    !!process.env.JEST_WORKER_ID || !!process.env.FOR_DETOX || !!Config.FOR_DETOX;

global.IS_JEST = !!process.env.JEST_WORKER_ID