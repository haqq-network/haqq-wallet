import {hideModal, showModal} from '@app/helpers/modal';
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
    const hasReadPermissions =
      ((await cloud.getItem('haqq_test'))?.length || 0) > 0;
    const testFileWasRemoved = await cloud.removeItem('haqq_test');

    return Boolean(
      hasWritePermissions && hasReadPermissions && testFileWasRemoved,
    );
  } catch (err) {
    return false;
  } finally {
    hideModal('cloudVerification');
  }
};
