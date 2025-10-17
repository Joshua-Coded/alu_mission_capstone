import React from "react";

import {
  Box,
  Spinner,
  VStack,
  Text,
  useColorModeValue,
  Fade,
  Progress,
} from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minH?: string | number;
  fullScreen?: boolean;
  showProgress?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'lg',
  minH = '200px',
  fullScreen = false,
  showProgress = false,
  variant = 'spinner',
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const spinnerColor = useColorModeValue('green.500', 'green.400');
  const bgColor = useColorModeValue('white', 'gray.800');

  // Dots animation variant
  const DotsLoader = () => (
    <Box display="flex" gap={2}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          w="10px"
          h="10px"
          borderRadius="full"
          bg={spinnerColor}
          animation={`bounce 1.4s infinite ease-in-out both`}
          css={{
            animationDelay: `${i * 0.16}s`,
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
              },
              '40%': {
                transform: 'scale(1)',
              },
            },
          }}
        />
      ))}
    </Box>
  );

  // Pulse animation variant
  const PulseLoader = () => (
    <Box
      w="60px"
      h="60px"
      borderRadius="full"
      bg={spinnerColor}
      opacity={0.6}
      animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      css={{
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      }}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'spinner':
      default:
        return (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color={spinnerColor}
            size={size}
          />
        );
    }
  };

  const content = (
    <Fade in={true}>
      <VStack spacing={4}>
        {renderLoader()}
        {message && (
          <Text 
            color={textColor} 
            fontSize="sm"
            fontWeight="medium"
            textAlign="center"
          >
            {message}
          </Text>
        )}
        {showProgress && (
          <Progress
            size="xs"
            isIndeterminate
            colorScheme="green"
            w="200px"
            borderRadius="full"
          />
        )}
      </VStack>
    </Fade>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg={`${bgColor}CC`}
        backdropFilter="blur(8px)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minH={minH}
      w="full"
    >
      {content}
    </Box>
  );
};

// Preset loading components for common use cases
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner 
    message={message || "Loading page..."}
    fullScreen={true}
    size="xl"
  />
);

export const CardLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner 
    message={message || "Loading..."}
    minH="150px"
    size="md"
  />
);

export const InlineLoader: React.FC = () => (
  <LoadingSpinner 
    message=""
    minH="40px"
    size="sm"
    variant="dots"
  />
);

export const ButtonLoader: React.FC = () => (
  <Spinner size="sm" color="white" thickness="2px" speed="0.65s" />
);

export default LoadingSpinner;