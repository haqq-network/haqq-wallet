import {Alert} from 'react-native';

import {hideModal, showModal} from '@app/helpers/modal';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {Cloud} from '@app/services/cloud';
import {SssProviders} from '@app/services/provider-sss';
import {sleep} from '@app/utils';

const TEST_FILE_SIZE_BYTES = 256;

const logger = Logger.create('VerifyCloud', {
  enabled:
    __DEV__ || AppStore.isTesterModeEnabled || AppStore.isDeveloperModeEnabled,
});

export const verifyCloud = async (sssProvider: SssProviders) => {
  logger.log('VerifyCloud', 'Starting cloud verification process');
  showModal('cloudVerification', {sssProvider});
  logger.log('VerifyCloud', 'Showed cloud verification modal');

  try {
    const cloud = new Cloud();
    logger.log('VerifyCloud', 'Created new Cloud instance');

    await sleep(1000);
    logger.log('VerifyCloud', 'Waited for 1 second');

    const hasWritePermissions = await cloud.setItem(
      'haqq_test',
      '0'.repeat(TEST_FILE_SIZE_BYTES),
    );
    logger.log(
      'VerifyCloud',
      `Write permissions check result: ${hasWritePermissions}`,
    );

    if (!hasWritePermissions) {
      logger.log('VerifyCloud', 'No write permissions, showing alert');
      Alert.alert(
        getText(I18N.verifyCloudProblemsTitle),
        getText(I18N.verifyCloudProblemsNoWriteError),
      );
    }

    const hasReadPermissions =
      ((await cloud.getItem('haqq_test'))?.length || 0) > 0;
    logger.log(
      'VerifyCloud',
      `Read permissions check result: ${hasReadPermissions}`,
    );

    if (!hasReadPermissions) {
      logger.log('VerifyCloud', 'No read permissions, showing alert');
      Alert.alert(
        getText(I18N.verifyCloudProblemsTitle),
        getText(I18N.verifyCloudProblemsNoReadError),
      );
    }

    const testFileWasRemoved = await cloud.removeItem('haqq_test');
    logger.log(
      'VerifyCloud',
      `Test file removal result: ${testFileWasRemoved}`,
    );

    if (!testFileWasRemoved) {
      logger.log('VerifyCloud', 'Test file was not removed');
    }

    const result = Boolean(hasWritePermissions && hasReadPermissions);
    logger.log('VerifyCloud', `Verification result: ${result}`);
    return result;
  } catch (err) {
    logger.log('VerifyCloud', `Error occurred during verification: ${err}`);
    return false;
  } finally {
    logger.log('VerifyCloud', 'Hiding cloud verification modal');
    hideModal('cloudVerification');
  }
};
