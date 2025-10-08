import React from "react";
import { FiCheckCircle, FiCloud, FiDollarSign, FiTarget } from "react-icons/fi";
import { Activity } from "../../../types/farmer";

// import { useTranslation } from "../../../hooks/useTranslation";

import {
  Box,
  Flex,
  Text,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
//   const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'investment': return FiDollarSign;
      case 'milestone': return FiCheckCircle;
      case 'weather': return FiCloud;
      case 'goal': return FiTarget;
      default: return FiCheckCircle;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'investment': return 'blue.500';
      case 'milestone': return 'green.500';
      case 'weather': return 'orange.500';
      case 'goal': return 'purple.500';
      default: return 'gray.500';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Box
      pb={4}
      borderBottom="1px"
      borderColor={borderColor}
      _last={{ borderBottom: 'none', pb: 0 }}
    >
      <Flex align="start" gap={3}>
        <Box
          p={2}
          borderRadius="full"
          bg={useColorModeValue('gray.100', 'gray.700')}
        >
          <Icon
            as={getActivityIcon(activity.type)}
            color={getActivityIconColor(activity.type)}
            boxSize={4}
          />
        </Box>
        
        <Flex flex={1} justify="space-between" align="start">
          <Box>
            <Text fontWeight="semibold" mb={1}>
              {activity.title}
            </Text>
            {activity.amount && (
              <Text color="green.500" fontWeight="bold" fontSize="lg">
                ${activity.amount.toLocaleString()}
              </Text>
            )}
            <Text fontSize="sm" color="gray.600" mb={1}>
              {activity.description}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {formatTimeAgo(activity.timestamp)}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ActivityItem;
