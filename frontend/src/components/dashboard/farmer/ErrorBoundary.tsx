import React, { Component, ReactNode } from "react";
import { FiAlertTriangle, FiChevronDown, FiChevronUp, FiRefreshCw } from "react-icons/fi";

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('🚨 Dashboard Error Boundary Caught:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Store error info in state
    this.setState({ errorInfo });
    
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
    
    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // Reload the page as a fallback
    // Uncomment if you want automatic page reload on reset
    // window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Box 
          p={8} 
          maxW="800px" 
          mx="auto"
          mt={8}
        >
          <VStack spacing={6} align="stretch">
            {/* Main Error Alert */}
            <Alert 
              status="error" 
              borderRadius="xl"
              flexDirection="column"
              alignItems="flex-start"
              p={6}
              boxShadow="lg"
            >
              <HStack spacing={3} mb={4}>
                <Icon as={FiAlertTriangle} boxSize={6} />
                <Box>
                  <AlertTitle fontSize="xl" mb={1}>
                    Oops! Something went wrong
                  </AlertTitle>
                  <AlertDescription fontSize="md">
                    We encountered an unexpected error while loading this section of the dashboard.
                    Don't worry, your data is safe!
                  </AlertDescription>
                </Box>
              </HStack>

              {/* Error Message */}
              {this.state.error && (
                <Box 
                  w="full" 
                  mt={4}
                  p={4}
                  bg="red.50"
                  borderRadius="md"
                  border="1px"
                  borderColor="red.200"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="red.800" mb={2}>
                    Error Details:
                  </Text>
                  <Code 
                    fontSize="sm" 
                    colorScheme="red"
                    p={3}
                    borderRadius="md"
                    w="full"
                    display="block"
                    whiteSpace="pre-wrap"
                  >
                    {this.state.error.message}
                  </Code>
                </Box>
              )}

              {/* Action Buttons */}
              <HStack spacing={3} mt={4} w="full">
                <Button 
                  leftIcon={<FiRefreshCw />}
                  onClick={this.handleReset} 
                  colorScheme="red" 
                  size="md"
                  flex={1}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="md"
                  onClick={() => window.location.href = '/dashboard/farmer'}
                >
                  Go to Dashboard
                </Button>
              </HStack>

              {/* Show Technical Details Toggle (Development Only) */}
              {isDevelopment && this.state.errorInfo && (
                <Box w="full" mt={4}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={this.toggleDetails}
                    rightIcon={this.state.showDetails ? <FiChevronUp /> : <FiChevronDown />}
                  >
                    {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                  </Button>
                  
                  <Collapse in={this.state.showDetails}>
                    <Box 
                      mt={3}
                      p={4}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px"
                      borderColor="gray.200"
                      maxH="300px"
                      overflowY="auto"
                    >
                      <Text fontSize="xs" fontWeight="semibold" mb={2}>
                        Component Stack:
                      </Text>
                      <Code 
                        fontSize="xs" 
                        p={3}
                        borderRadius="md"
                        w="full"
                        display="block"
                        whiteSpace="pre-wrap"
                        bg="white"
                      >
                        {this.state.errorInfo.componentStack}
                      </Code>
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Alert>

            {/* Helpful Tips */}
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="md">What you can do:</AlertTitle>
                <AlertDescription>
                  <VStack align="start" spacing={1} mt={2}>
                    <Text fontSize="sm">• Click "Try Again" to reload this section</Text>
                    <Text fontSize="sm">• Refresh your browser page</Text>
                    <Text fontSize="sm">• Check your internet connection</Text>
                    <Text fontSize="sm">• Contact support if the problem persists</Text>
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>

            {/* Development Warning */}
            {isDevelopment && (
              <Alert status="warning" borderRadius="lg" variant="left-accent">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Development Mode</AlertTitle>
                  <AlertDescription fontSize="xs">
                    This detailed error view is only visible in development. 
                    In production, users will see a simpler error message.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;