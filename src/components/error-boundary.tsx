import React, {PureComponent} from 'react';

import {Text, View} from 'react-native';

export type ErrorBoundaryProps = {
  fallback: React.ReactNode;
};

export class ErrorBoundary extends PureComponent {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {error: null, errorInfo: null};
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <View>
          <Text>Something went wrong.</Text>
          <Text>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.errorInfo.componentStack}
          </Text>
        </View>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}
