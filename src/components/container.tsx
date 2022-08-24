import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, ViewProps } from 'react-native';

export const Container = ({ children, style, ...props }: ViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <SafeAreaView {...props} style={containerStyle}>
      {children}
    </SafeAreaView>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    margin: 20,
  },
});
