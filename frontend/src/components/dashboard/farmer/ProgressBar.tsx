import React from "react";
import { FiAlertCircle, FiCheckCircle, FiTrendingUp } from "react-icons/fi";

import {
  Box,
  Progress,
  HStack,
  Text,
  VStack,
  useColorModeValue,
  Tooltip,
  Badge,
  Icon,
} from '@chakra-ui/react';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  current?: string | number;
  goal?: string | number;
  colorScheme?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  striped?: boolean;
  helperText?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  current,
  goal,
  colorScheme = 'green',
  size = 'md',
  showPercentage = true,
  showIcon = false,
  animated = true,
  striped = false,
  helperText,
}) => {
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  
  const percentage = Math.min((value / max) * 100, 100);
  const isComplete = percentage >= 100;
  const isLow = percentage < 25;
  
  // Auto color based on percentage
  const getColorScheme = () => {
    if (colorScheme !== 'green') return colorScheme;
    if (isComplete) return 'green';
    if (isLow) return 'red';
    if (percentage < 50) return 'orange';
    if (percentage < 75) return 'yellow';
    return 'green';
  };

  const dynamicColorScheme = getColorScheme();

  // Get status icon
  const getStatusIcon = () => {
    if (isComplete) return FiCheckCircle;
    if (isLow) return FiAlertCircle;
    return FiTrendingUp;
  };

  const StatusIcon = getStatusIcon();
  const iconColor = isComplete ? 'green.500' : isLow ? 'red.500' : 'blue.500';

  return (
    <VStack spacing={2} align="stretch" w="full">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          {showIcon && (
            <Icon as={StatusIcon} color={iconColor} boxSize={4} />
          )}
          <Text fontSize="sm" fontWeight="medium" color={labelColor}>
            {label}
          </Text>
        </HStack>
        
        <HStack spacing={2}>
          {current !== undefined && goal !== undefined ? (
            <Tooltip label={`${percentage.toFixed(1)}% complete`} hasArrow>
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                {typeof current === 'number' ? current.toLocaleString() : current} / {typeof goal === 'number' ? goal.toLocaleString() : goal}
              </Text>
            </Tooltip>
          ) : showPercentage ? (
            <Badge 
              colorScheme={dynamicColorScheme} 
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="md"
            >
              {percentage.toFixed(1)}%
            </Badge>
          ) : null}
          
          {isComplete && (
            <Badge colorScheme="green" fontSize="xs" px={2} py={1}>
              Complete ✓
            </Badge>
          )}
        </HStack>
      </HStack>

      {/* Progress Bar */}
      <Tooltip 
        label={`${percentage.toFixed(1)}% • ${value} / ${max}`}
        hasArrow
        placement="top"
      >
        <Box>
          <Progress
            value={percentage}
            colorScheme={dynamicColorScheme}
            size={size}
            borderRadius="full"
            bg={bgColor}
            hasStripe={striped}
            isAnimated={animated}
            transition="all 0.3s ease"
          />
        </Box>
      </Tooltip>

      {/* Helper Text */}
      {helperText && (
        <Text fontSize="xs" color={labelColor}>
          {helperText}
        </Text>
      )}
    </VStack>
  );
};

// Preset variants for common use cases
export const FundingProgress: React.FC<{
  current: number;
  goal: number;
  label?: string;
}> = ({ current, goal, label = "Funding Progress" }) => (
  <ProgressBar
    label={label}
    value={current}
    max={goal}
    current={`$${current.toLocaleString()}`}
    goal={`$${goal.toLocaleString()}`}
    colorScheme="green"
    showIcon={true}
    animated={true}
  />
);

export const TaskProgress: React.FC<{
  completed: number;
  total: number;
  label?: string;
}> = ({ completed, total, label = "Tasks Completed" }) => (
  <ProgressBar
    label={label}
    value={completed}
    max={total}
    current={completed}
    goal={total}
    colorScheme="blue"
    showIcon={true}
    helperText={`${total - completed} remaining`}
  />
);

export const MilestoneProgress: React.FC<{
  percentage: number;
  label: string;
}> = ({ percentage, label }) => (
  <ProgressBar
    label={label}
    value={percentage}
    max={100}
    showPercentage={true}
    showIcon={true}
    striped={percentage < 100}
    animated={true}
  />
);

export default ProgressBar;