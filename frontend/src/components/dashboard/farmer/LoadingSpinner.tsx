import React from "react";

import {
  Box,
  Spinner,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'lg'
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size={size}
        />
        <Text color={textColor} fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingSpinner;
