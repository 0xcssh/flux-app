import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { H3, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <H3 align="center" style={styles.title}>
            Something went wrong
          </H3>
          <Body
            color={Colors.textSecondary}
            align="center"
            style={styles.message}
          >
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Body>
          <Button
            title="Retry"
            onPress={this.handleRetry}
            variant="primary"
            style={styles.button}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
  },
  button: {
    minWidth: 120,
  },
});
