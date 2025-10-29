import  contributionApi  from "@/lib/contributionApi";
import React, { useEffect, useState } from "react";
import { FiDollarSign, FiFolder, FiTrendingUp, FiUsers } from "react-icons/fi";
import { projectApi } from "@/lib/projectApi";

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
  useToast,
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
  totalProjects: number;
}

const FarmerStatsGrid: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Loading farmer stats from API...');
      
      // Fetch projects using the real API client
      const projects = await projectApi.getMyProjects();
      
      console.log('📈 Projects for stats:', projects.length);
      
      // Calculate real statistics from projects
      const totalFunding = projects.reduce((sum: number, p: any) => sum + (p.currentFunding || 0), 0);
      const activeProjects = projects.filter((p: any) => p.status === 'active' || p.status === 'verified').length;
      const totalProjects = projects.length;
      
      // Calculate total contributors across all projects
      let totalContributors = 0;
      
      // Fetch contributions for each project to get real contributor count
      for (const project of projects) {
        try {
          const contributionsResponse = await contributionApi.getProjectContributions(project._id);
          if (contributionsResponse.success && contributionsResponse.data) {
            totalContributors += contributionsResponse.data.contributorCount || 0;
          }
        } catch (error) {
          console.error(`Error fetching contributions for project ${project._id}:`, error);
          // Use project's contributor count as fallback
          totalContributors += project.contributorsCount || 0;
        }
      }
      
      // Calculate average funding progress
      const projectsWithGoals = projects.filter((p: any) => p.fundingGoal > 0);
      const avgFundingProgress = projectsWithGoals.length > 0
        ? projectsWithGoals.reduce((sum: number, p: any) => 
            sum + ((p.currentFunding / p.fundingGoal) * 100), 0) / projectsWithGoals.length
        : 0;
      
      // Calculate changes (you can enhance this with historical data later)
      const calculatedStats: StatsData = {
        totalFunding,
        fundingChange: calculateFundingChange(projects), // Mock for now
        activeProjects,
        projectsChange: calculateProjectsChange(projects), // Mock for now
        totalContributors,
        contributorsChange: calculateContributorsChange(projects), // Mock for now
        avgFundingProgress,
        progressChange: calculateProgressChange(projects), // Mock for now
        totalProjects,
      };
      
      console.log('✅ Calculated stats:', calculatedStats);
      setStats(calculatedStats);
      
    } catch (error: any) {
      console.error('❌ Error loading farmer stats:', error);
      toast({
        title: 'Error loading statistics',
        description: error.message || 'Failed to load dashboard statistics',
        status: 'error',
        duration: 5000,
      });
      
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
        totalProjects: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock change calculation functions - you can replace these with real historical data
  const calculateFundingChange = (projects: any[]): number => {
    if (projects.length === 0) return 0;
    // For now, return a mock positive change
    return 12.5;
  };

  const calculateProjectsChange = (projects: any[]): number => {
    if (projects.length === 0) return 0;
    // For now, return a mock positive change
    return 8.2;
  };

  const calculateContributorsChange = (projects: any[]): number => {
    if (projects.length === 0) return 0;
    // For now, return a mock positive change
    return 15.3;
  };

  const calculateProgressChange = (projects: any[]): number => {
    if (projects.length === 0) return 0;
    // For now, return a mock positive change
    return 5.7;
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
      value: `${stats.totalFunding.toFixed(4)} MATIC`,
      change: stats.fundingChange,
      icon: FiDollarSign,
      color: 'green',
      description: 'Across all projects',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: stats.projectsChange,
      icon: FiFolder,
      color: 'blue',
      description: 'Currently seeking funding',
    },
    {
      label: 'Total Contributors',
      value: stats.totalContributors.toString(),
      change: stats.contributorsChange,
      icon: FiUsers,
      color: 'purple',
      description: 'Investors supporting you',
    },
    {
      label: 'Avg. Funding Progress',
      value: `${stats.avgFundingProgress.toFixed(1)}%`,
      change: stats.progressChange,
      icon: FiTrendingUp,
      color: 'orange',
      description: 'Across active projects',
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
                <Box flex={1}>
                  <StatLabel fontSize="sm" color="gray.500" mb={1}>
                    {stat.label}
                  </StatLabel>
                  <StatNumber fontSize="2xl" color={`${stat.color}.500`} fontWeight="bold">
                    {stat.value}
                  </StatNumber>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {stat.description}
                  </Text>
                  {stat.change !== 0 && (
                    <StatHelpText mb={0} mt={2}>
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
                  ml={3}
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