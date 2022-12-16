// stories/MyButton.stories.tsx
import React from 'react';

import {ComponentMeta, ComponentStory} from '@storybook/react';

import {MyButton} from './Button';

// eslint-disable-next-line import/no-default-export
export default {
  title: 'components/MyButton',
  component: MyButton,
} as ComponentMeta<typeof MyButton>;

export const Basic: ComponentStory<typeof MyButton> = args => (
  <MyButton {...args} />
);

Basic.args = {
  text: 'Hello World',
  color: 'purple',
};
