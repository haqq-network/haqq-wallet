import React from 'react';
import {Text} from './ui';
import {HeaderTitleProps} from '@react-navigation/elements';

interface HeaderTitleT extends HeaderTitleProps {
  headerTitle?: string;
}

export const TabHeader = ({headerTitle}: HeaderTitleT) => {
  return <Text t8>{headerTitle}</Text>;
};
