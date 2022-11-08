import React from 'react';
import {requireNativeComponent, StyleProp, ViewStyle} from 'react-native';

const QRView = requireNativeComponent('RNQRView');

export type QRProps = {value: string; style?: StyleProp<ViewStyle>};

export const QR = ({style, value}: QRProps) => {
  return <QRView style={style} value={value} />;
};
