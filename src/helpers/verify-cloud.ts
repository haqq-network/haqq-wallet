import {Alert} from 'react-native';

import {hideModal, showModal} from '@app/helpers/modal';
import {I18N, getText} from '@app/i18n';
import {Cloud} from '@app/services/cloud';
import {SssProviders} from '@app/services/provider-sss';
import {sleep} from '@app/utils';

const TEST_FILE_SIZE_BYTES = 256;

export const verifyCloud = async (sssProvider: SssProviders) => {
  showModal('cloudVerification', {sssProvider});
  try {
    const cloud = new Cloud();
    await sleep(1000);

    const hasWritePermissions = await cloud.setItem(
      'haqq_test',
      '0'.repeat(TEST_FILE_SIZE_BYTES),
    );
    if (!hasWritePermissions) {
      Alert.alert(
        getText(I18N.verifyCloudProblemsTitle),
        getText(I18N.verifyCloudProblemsNoWriteError),
      );
    }
    const hasReadPermissions =
      ((await cloud.getItem('haqq_test'))?.length || 0) > 0;
    if (!hasReadPermissions) {
      Alert.alert(
        getText(I18N.verifyCloudProblemsTitle),
        getText(I18N.verifyCloudProblemsNoReadError),
      );
    }
    const testFileWasRemoved = await cloud.removeItem('haqq_test');
    if (!testFileWasRemoved) {
      // Logger.log('SSS_VERIFY_CLOUD', 'test file was not removed');
    }

    return Boolean(hasWritePermissions && hasReadPermissions);
  } catch (err) {
    Logger.log('VerifyCloud', err);
    return false;
  } finally {
    hideModal('cloudVerification');
  }
};
