import React from "react";

import {
  Box,
  Progress,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  current?: string;
  goal?: string;
  colorScheme?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  current,
  goal,
  colorScheme = 'brand',
  size = 'md',
  showPercentage = true
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <VStack spacing={2} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color={textColor}>
          {label}
        </Text>
        {current && goal ? (
          <Text fontSize="sm" fontWeight="semibold">
            {current} / {goal}
          </Text>
        ) : showPercentage ? (
          <Text fontSize="sm" fontWeight="semibold">
            {percentage.toFixed(1)}%
          </Text>
        ) : null}
      </HStack>
      <Progress
        value={percentage}
        colorScheme={colorScheme}
        size={size}
        borderRadius="full"
        bg="gray.200"
      />
    </VStack>
  );
};

export default ProgressBar;
