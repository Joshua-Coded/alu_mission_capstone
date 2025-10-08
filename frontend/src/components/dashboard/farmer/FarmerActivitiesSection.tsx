import React from "react";
import { FiCheckCircle, FiCloud, FiDollarSign, FiTarget, FiTrendingUp } from "react-icons/fi";

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  Box,
  Text,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';

const FarmerActivitiesSection: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const recentActivities = [
    { 
      id: 1,
      action: 'New investment received', 
      amount: '$2,500', 
      time: '2 hours ago', 
      investor: 'John Smith',
      type: 'investment',
      icon: FiDollarSign,
      color: 'green'
    },
    { 
      id: 2,
      action: 'Crop milestone achieved', 
      detail: 'Planting Phase Complete', 
      time: '1 day ago',
      type: 'milestone',
      icon: FiCheckCircle,
      color: 'blue'
    },
    { 
      id: 3,
      action: 'Weather alert', 
      detail: 'Rain expected next week', 
      time: '2 days ago',
      type: 'weather',
      icon: FiCloud,
      color: 'orange'
    },
    { 
      id: 4,
      action: 'Investment goal reached', 
      amount: '$10,000', 
      time: '1 week ago',
      type: 'goal',
      icon: FiTarget,
      color: 'purple'
    },
    {
      id: 5,
      action: 'ROI milestone achieved',
      detail: '15% return delivered to investors',
      time: '1 week ago',
      type: 'roi',
      icon: FiTrendingUp,
      color: 'green'
    }
  ];

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor} h="fit-content">
      <CardHeader>
        <Heading size="md" color="brand.600">
          Recent Activities
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {recentActivities.map((activity, index) => (
            <Box key={activity.id}>
              <HStack spacing={3} align="start">
                <Box
                  p={2}
                  bg={`${activity.color}.100`}
                  borderRadius="full"
                  flexShrink={0}
                >
                  <Icon as={activity.icon} boxSize={4} color={`${activity.color}.500`} />
                </Box>
                
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {activity.action}
                  </Text>
                  
                  {activity.amount && (
                    <Text fontSize="sm" color="green.600" fontWeight="semibold">
                      {activity.amount}
                    </Text>
                  )}
                  
                  {activity.detail && (
                    <Text fontSize="sm" color="gray.600">
                      {activity.detail}
                    </Text>
                  )}
                  
                  {activity.investor && (
                    <Badge colorScheme="blue" size="sm">
                      from {activity.investor}
                    </Badge>
                  )}
                  
                  <Text fontSize="xs" color="gray.400">
                    {activity.time}
                  </Text>
                </VStack>
              </HStack>
              
              {index < recentActivities.length - 1 && <Divider mt={3} />}
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default FarmerActivitiesSection;
