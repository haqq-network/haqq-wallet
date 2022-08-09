import React from 'react';
import {SafeAreaView, ViewProps} from 'react-native';

export const Container = ({children, style, ...props}: ViewProps) => {
  return (
    <SafeAreaView
      {...props}
      style={[{flex: 1, justifyContent: 'flex-start', padding: 10}, style]}>
      {children}
    </SafeAreaView>
  );
};
