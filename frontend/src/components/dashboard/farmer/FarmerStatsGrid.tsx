import React from "react";
import { FiDollarSign, FiTrendingUp, FiUsers } from "react-icons/fi";
import { GiWheat } from "react-icons/gi";

import {
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

const FarmerStatsGrid: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const farmStats = [
    {
      label: 'Total Funding Raised',
      value: '$45,250',
      change: 12.5,
      icon: FiDollarSign,
      color: 'green',
    },
    {
      label: 'Active Investors',
      value: '23',
      change: 8.2,
      icon: FiUsers,
      color: 'blue',
    },
    {
      label: 'Crop Yield (tons)',
      value: '156.8',
      change: -2.1,
      icon: GiWheat,
      color: 'orange',
    },
    {
      label: 'ROI Delivered',
      value: '18.5%',
      change: 5.3,
      icon: FiTrendingUp,
      color: 'purple',
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      {farmStats.map((stat, index) => (
        <Card 
          key={index} 
          bg={cardBg} 
          border="1px" 
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{
            transform: 'translateY(-4px)',
            shadow: 'lg',
            borderColor: `${stat.color}.300`
          }}
        >
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="start">
                <Box>
                  <StatLabel fontSize="sm" color="gray.500">
                    {stat.label}
                  </StatLabel>
                  <StatNumber fontSize="2xl" color={`${stat.color}.500`} fontWeight="bold">
                    {stat.value}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={stat.change > 0 ? 'increase' : 'decrease'} />
                    {Math.abs(stat.change)}% from last month
                  </StatHelpText>
                </Box>
                <Box
                  p={3}
                  bg={`${stat.color}.100`}
                  borderRadius="lg"
                >
                  <Icon as={stat.icon} boxSize={6} color={`${stat.color}.500`} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default FarmerStatsGrid;
