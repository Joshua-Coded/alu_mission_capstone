import React, { useEffect, useState } from "react";
import { FiDollarSign, FiFolder, FiTrendingUp, FiUsers } from "react-icons/fi";

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
  Spinner,
  VStack,
  Text,
} from '@chakra-ui/react';

interface StatsData {
  totalFunding: number;
  fundingChange: number;
  activeProjects: number;
  projectsChange: number;
  totalContributors: number;
  contributorsChange: number;
  avgFundingProgress: number;
  progressChange: number;
}

const FarmerStatsGrid: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Fetch projects from your real API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/my-projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const projects = await response.json();
      
      // Calculate real statistics
      const totalFunding = projects.reduce((sum: number, p: any) => sum + (p.currentFunding || 0), 0);
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const totalContributors = projects.reduce((sum: number, p: any) => sum + (p.contributorsCount || 0), 0);
      
      // Calculate average funding progress
      const projectsWithGoals = projects.filter((p: any) => p.fundingGoal > 0);
      const avgFundingProgress = projectsWithGoals.length > 0
        ? projectsWithGoals.reduce((sum: number, p: any) => 
            sum + ((p.currentFunding / p.fundingGoal) * 100), 0) / projectsWithGoals.length
        : 0;
      
      // Mock change percentages 
      const calculatedStats: StatsData = {
        totalFunding,
        fundingChange: totalFunding > 0 ? 12.5 : 0, // TODO: Calculate from historical data
        activeProjects,
        projectsChange: activeProjects > 0 ? 8.2 : 0, // TODO: Calculate from historical data
        totalContributors,
        contributorsChange: totalContributors > 0 ? 15.3 : 0, // TODO: Calculate from historical data
        avgFundingProgress,
        progressChange: avgFundingProgress > 0 ? 5.7 : 0, // TODO: Calculate from historical data
      };
      
      setStats(calculatedStats);
      
    } catch (error) {
      console.error('Error loading farmer stats:', error);
      // Set default stats on error
      setStats({
        totalFunding: 0,
        fundingChange: 0,
        activeProjects: 0,
        projectsChange: 0,
        totalContributors: 0,
        contributorsChange: 0,
        avgFundingProgress: 0,
        progressChange: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} py={4}>
                <Spinner size="lg" color="green.500" />
                <Text fontSize="sm" color="gray.500">Loading...</Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (!stats) return null;

  const farmStats = [
    {
      label: 'Total Funding Raised',
      value: `$${stats.totalFunding.toLocaleString()}`,
      change: stats.fundingChange,
      icon: FiDollarSign,
      color: 'green',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: stats.projectsChange,
      icon: FiFolder,
      color: 'blue',
    },
    {
      label: 'Total Contributors',
      value: stats.totalContributors.toString(),
      change: stats.contributorsChange,
      icon: FiUsers,
      color: 'purple',
    },
    {
      label: 'Avg. Funding Progress',
      value: `${stats.avgFundingProgress.toFixed(1)}%`,
      change: stats.progressChange,
      icon: FiTrendingUp,
      color: 'orange',
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
                  <StatLabel fontSize="sm" color="gray.500" mb={1}>
                    {stat.label}
                  </StatLabel>
                  <StatNumber fontSize="2xl" color={`${stat.color}.500`} fontWeight="bold">
                    {stat.value}
                  </StatNumber>
                  {stat.change !== 0 && (
                    <StatHelpText mb={0}>
                      <StatArrow type={stat.change > 0 ? 'increase' : 'decrease'} />
                      {Math.abs(stat.change).toFixed(1)}% from last month
                    </StatHelpText>
                  )}
                </Box>
                <Box
                  p={3}
                  bg={`${stat.color}.100`}
                  borderRadius="lg"
                  flexShrink={0}
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