import React from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";

// import { useTranslation } from "../../../hooks/useTranslation";

import {
  Box,
  Flex,
  Text,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
//   const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isPositive = change > 0;

  const colorSchemes = {
    green: 'green.500',
    blue: 'blue.500',
    orange: 'orange.500',
    purple: 'purple.500'
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
        shadow: 'lg'
      }}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" color="gray.500" fontWeight="medium">
          {title}
        </Text>
        <Box
          bg={colorSchemes[color]}
          p={2}
          borderRadius="lg"
          fontSize="lg"
        >
          {icon}
        </Box>
      </Flex>
      
      <Text fontSize="3xl" fontWeight="bold" color="gray.700" mb={2}>
        {value}
      </Text>
      
      <HStack spacing={1}>
        <Icon 
          as={isPositive ? FiTrendingUp : FiTrendingDown}
          color={isPositive ? 'green.500' : 'red.500'}
        />
        <Text
          fontSize="sm"
          color={isPositive ? 'green.500' : 'red.500'}
          fontWeight="medium"
        >
          {/* {Math.abs(change)}% {t('fromLastMonth')} */}
        </Text>
      </HStack>
    </Box>
  );
};

export default StatCard;