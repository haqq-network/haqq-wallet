import {expect} from 'detox';

export const isVisible = async (id: string) => {
  try {
    await expect(element(by.id(id))).toBeVisible();
    return true;
  } catch (e) {
    return false;
  }
};
