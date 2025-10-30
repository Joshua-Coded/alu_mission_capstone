import React from "react";
import { FiMinus, FiTrendingDown, FiTrendingUp } from "react-icons/fi";

import {
  Box,
  Flex,
  Text,
  HStack,
  Icon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'teal';
  prefix?: string;
  suffix?: string;
  helpText?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change,
  icon: IconComponent, 
  color = 'green',
  prefix = '',
  suffix = '',
  helpText,
  isLoading = false,
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === 0;

  const colorSchemes: Record<string, string> = {
    green: 'green.500',
    blue: 'blue.500',
    orange: 'orange.500',
    purple: 'purple.500',
    red: 'red.500',
    teal: 'teal.500',
  };

  const getTrendIcon = () => {
    if (isNeutral) return FiMinus;
    return isPositive ? FiTrendingUp : FiTrendingDown;
  };

  const getTrendColor = () => {
    if (isNeutral) return 'gray.500';
    return isPositive ? 'green.500' : 'red.500';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      borderTop="4px"
      borderTopColor={colorSchemes[color]}
      shadow="sm"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: colorSchemes[color],
      }}
      cursor="default"
      position="relative"
      overflow="hidden"
    >
      {/* Background Icon Watermark */}
      <Icon
        as={IconComponent}
        position="absolute"
        right={-2}
        bottom={-2}
        boxSize={24}
        color={colorSchemes[color]}
        opacity={0.05}
      />

      <Flex justify="space-between" align="center" mb={4}>
        <Tooltip label={helpText || title} hasArrow placement="top">
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            {title}
          </Text>
        </Tooltip>
        <Box
          bg={`${color}.50`}
          p={2}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={IconComponent} color={colorSchemes[color]} boxSize={5} />
        </Box>
      </Flex>
      
      <HStack spacing={1} mb={2}>
        {prefix && (
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            {prefix}
          </Text>
        )}
        <Text fontSize="3xl" fontWeight="bold" color={textColor}>
          {isLoading ? '...' : formatValue(value)}
        </Text>
        {suffix && (
          <Text fontSize="xl" fontWeight="medium" color="gray.500">
            {suffix}
          </Text>
        )}
      </HStack>
      
      {change !== undefined && !isLoading && (
        <HStack spacing={2}>
          <HStack spacing={1}>
            <Icon 
              as={getTrendIcon()}
              color={getTrendColor()}
              boxSize={4}
            />
            <Text
              fontSize="sm"
              color={getTrendColor()}
              fontWeight="semibold"
            >
              {Math.abs(change).toFixed(1)}%
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            from last month
          </Text>
        </HStack>
      )}

      {helpText && change === undefined && (
        <Text fontSize="xs" color="gray.500" mt={2}>
          {helpText}
        </Text>
      )}
    </Box>
  );
};

// Preset Stat Cards for common use cases
export const FundingStatCard: React.FC<{
  value: number;
  change?: number;
  icon: React.ElementType;
}> = ({ value, change, icon }) => (
  <StatCard
    title="Total Funding"
    value={value}
    change={change}
    icon={icon}
    color="green"
    prefix="$"
    helpText="Total funding raised across all projects"
  />
);

export const ProjectsStatCard: React.FC<{
  value: number;
  change?: number;
  icon: React.ElementType;
}> = ({ value, change, icon }) => (
  <StatCard
    title="Active Projects"
    value={value}
    change={change}
    icon={icon}
    color="blue"
    helpText="Projects currently accepting funding"
  />
);

export const ContributorsStatCard: React.FC<{
  value: number;
  change?: number;
  icon: React.ElementType;
}> = ({ value, change, icon }) => (
  <StatCard
    title="Total Backers"
    value={value}
    change={change}
    icon={icon}
    color="purple"
    helpText="Total number of project supporters"
  />
);

export const ProgressStatCard: React.FC<{
  value: number;
  change?: number;
  icon: React.ElementType;
}> = ({ value, change, icon }) => (
  <StatCard
    title="Avg. Progress"
    value={value}
    change={change}
    icon={icon}
    color="orange"
    suffix="%"
    helpText="Average funding progress across projects"
  />
);

export default StatCard;