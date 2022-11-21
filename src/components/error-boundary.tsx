import React, {PureComponent} from 'react';

import {Text, View} from 'react-native';

export type ErrorBoundaryProps = {
  fallback: React.ReactNode;
  children: React.ReactNode;
};

type State = {
  error: any;
  errorInfo: any;
};

export class ErrorBoundary extends PureComponent<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {error: null, errorInfo: null};
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state && this.state?.errorInfo) {
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

    return this.props.children;
  }
}
