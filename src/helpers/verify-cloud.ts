import {hideModal, showModal} from '@app/helpers/modal';
import {Cloud} from '@app/services/cloud';
import {SssProviders} from '@app/services/provider-sss';
import {sleep} from '@app/utils';

const TEST_FILE_SIZE_BYTES = 256;

export const verifyCloud = async (sssProvider: SssProviders) => {
  showModal('cloudVerification', {sssProvider});
  const cloud = new Cloud();

  const hasWritePermissions = await cloud.setItem(
    'haqq_test',
    '0'.repeat(TEST_FILE_SIZE_BYTES),
  );
  const hasReadPermissions =
    ((await cloud.getItem('haqq_test'))?.length || 0) > 0;
  const testFileWasRemoved = await cloud.removeItem('haqq_test');

  await sleep(1000);
  hideModal('cloudVerification');
  return Boolean(
    hasWritePermissions && hasReadPermissions && testFileWasRemoved,
  );
};
