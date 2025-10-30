import  contributionApi  from "@/lib/contributionApi";
import { useCallback, useEffect, useState } from "react";
import { Project, projectApi } from "@/lib/projectApi";

// ============================================
// FILE: components/government/MonthlySummary.tsx
// ============================================
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  Flex,
  Text,
  Divider,
  useColorModeValue,
  Icon,
  HStack,
  Badge,
  SimpleGrid,
  Box,
  Tooltip,
  useToast,
  Spinner,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCheckCircle, 
  FiFileText,
  FiAlertCircle,
  FiCalendar,
  FiRefreshCw,
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi';

interface MonthlySummaryProps {
  projects: Project[];
  onRefresh?: () => void;
}

export default function MonthlySummary({ projects, onRefresh }: MonthlySummaryProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [loading, setLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<{
    currentMonthProjects: Project[];
    previousMonthProjects: Project[];
    currentMonthContributors: number;
    previousMonthContributors: number;
    platformStats: unknown;
  } | null>(null);
  const toast = useToast();

  // Calculate current month metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Fetch additional monthly statistics - MOVE THIS useEffect AFTER fetchMonthlyStats definition
const fetchMonthlyStats = useCallback(async () => {
  try {
    setLoading(true);
    
    // Get platform stats for additional insights
    const platformStats = await projectApi.getPlatformStats();
    
    // Calculate current month metrics from projects
    const currentMonthProjects = projects.filter(p => {
      const date = new Date(p.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonthProjects = projects.filter(p => {
      const date = new Date(p.createdAt);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    });

    // Calculate contributor growth for current month
    let currentMonthContributors = 0;
    let previousMonthContributors = 0;

    for (const project of currentMonthProjects) {
      try {
        const contributions = await contributionApi.getProjectContributions(project._id);
        if (contributions.success && contributions.data) {
          currentMonthContributors += contributions.data.contributorCount || 0;
        }
      } catch (error) {
        console.error(`Error fetching contributions for project ${project._id}:`, error);
      }
    }

    for (const project of previousMonthProjects) {
      try {
        const contributions = await contributionApi.getProjectContributions(project._id);
        if (contributions.success && contributions.data) {
          previousMonthContributors += contributions.data.contributorCount || 0;
        }
      } catch (error) {
        console.error(`Error fetching contributions for project ${project._id}:`, error);
      }
    }

    const stats = {
      currentMonthProjects,
      previousMonthProjects,
      currentMonthContributors,
      previousMonthContributors,
      platformStats,
    };

    setMonthlyStats(stats);
  } catch (error: unknown) {
    console.error('Error fetching monthly stats:', error);
    toast({
      title: 'Error loading monthly statistics',
      description: 'Some metrics may be incomplete',
      status: 'warning',
      duration: 3000,
    });
  } finally {
    setLoading(false);
  }
}, [projects, currentMonth, currentYear, previousMonth, previousYear, toast]);

// NOW put the useEffect AFTER the useCallback
useEffect(() => {
  fetchMonthlyStats();
}, [fetchMonthlyStats]);

  // Calculate metrics
  const newProjects = monthlyStats?.currentMonthProjects.length || 0;
  const previousNewProjects = monthlyStats?.previousMonthProjects.length || 0;
  const projectGrowth = previousNewProjects > 0 
    ? (((newProjects - previousNewProjects) / previousNewProjects) * 100).toFixed(1)
    : newProjects > 0 ? '100.0' : '0';

  // Compliance checks (due diligence completed this month)
  const complianceChecks = monthlyStats?.currentMonthProjects.filter((p: Project) => 
    p.dueDiligence?.status === 'completed' ||
    (p.dueDiligence?.completedAt && 
    new Date(p.dueDiligence.completedAt).getMonth() === currentMonth)
  ).length || 0;

  // Approvals this month
  const approvals = monthlyStats?.currentMonthProjects.filter((p: Project) => 
    p.status === 'active' || p.status === 'verified' || p.status === 'funded'
  ).length || 0;

  // Rejections this month
  const rejections = monthlyStats?.currentMonthProjects.filter((p: Project) => 
    p.status === 'rejected'
  ).length || 0;

  // Average processing time (in days)
  const completedProjects = monthlyStats?.currentMonthProjects.filter((p: Project) => 
    p.status === 'active' || p.status === 'rejected' || p.status === 'verified'
  ) || [];
  
  const avgProcessingTime = completedProjects.length > 0
    ? completedProjects.reduce((sum: number, p: Project) => {
        const start = new Date(p.submittedAt || p.createdAt);
        const end = new Date(p.verification?.verifiedAt || p.updatedAt);
        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / completedProjects.length
    : 0;

  // Total funding this month (in MATIC)
  const totalFunding = monthlyStats?.currentMonthProjects
    .filter((p: Project) => p.status === 'active' || p.status === 'verified' || p.status === 'funded')
    .reduce((sum: number, p: Project) => sum + p.fundingGoal, 0) || 0;

  // Current funding raised this month
  const currentFunding = monthlyStats?.currentMonthProjects
    .filter((p: Project) => p.status === 'active' || p.status === 'verified' || p.status === 'funded')
    .reduce((sum: number, p: Project) => sum + (p.currentFunding || 0), 0) || 0;

  // Contributor metrics
  const currentMonthContributors = monthlyStats?.currentMonthContributors || 0;
  const previousMonthContributors = monthlyStats?.previousMonthContributors || 0;
  const contributorGrowth = previousMonthContributors > 0 
    ? (((currentMonthContributors - previousMonthContributors) / previousMonthContributors) * 100).toFixed(1)
    : currentMonthContributors > 0 ? '100.0' : '0';

  // Platform growth percentage
  const platformGrowth = parseFloat(projectGrowth) >= 0 
    ? `+${projectGrowth}%` 
    : `${projectGrowth}%`;

  const isGrowthPositive = parseFloat(projectGrowth) >= 0;
  const isContributorGrowthPositive = parseFloat(contributorGrowth) >= 0;

  // Get current month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentMonth];

  const formatMatic = (amount: number) => {
    return `${amount.toFixed(2)} MATIC`;
  };

  const handleRefresh = () => {
    fetchMonthlyStats();
    if (onRefresh) {
      onRefresh();
    }
    toast({
      title: 'Refreshing monthly data...',
      status: 'info',
      duration: 2000,
    });
  };

  if (loading && !monthlyStats) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
        <CardBody>
          <VStack spacing={4} py={8}>
            <Spinner size="lg" color="purple.500" />
            <Text color="gray.600">Loading monthly summary...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
      <CardHeader>
        <HStack justify="space-between">
          <Box>
            <Heading size="md" color="purple.600">
              Monthly Performance
            </Heading>
            <HStack mt={1} spacing={2}>
              <Icon as={FiCalendar} color="gray.500" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                {currentMonthName} {currentYear}
              </Text>
            </HStack>
          </Box>
          <HStack spacing={2}>
            <Badge 
              colorScheme={isGrowthPositive ? 'green' : 'red'}
              fontSize="sm"
              px={2}
              py={1}
            >
              <HStack spacing={1}>
                <Icon as={isGrowthPositive ? FiTrendingUp : FiTrendingDown} />
                <Text>{platformGrowth}</Text>
              </HStack>
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              isLoading={loading}
            >
              <FiRefreshCw />
            </Button>
          </HStack>
        </HStack>

        {/* Quick Stats Header */}
        <HStack spacing={4} mt={3} fontSize="sm" flexWrap="wrap">
          <Badge colorScheme="purple" variant="subtle">
            📊 {newProjects} New Projects
          </Badge>
          <Badge colorScheme="green" variant="subtle">
            ✅ {approvals} Approved
          </Badge>
          <Badge colorScheme="teal" variant="subtle">
            🤝 {currentMonthContributors} Contributors
          </Badge>
        </HStack>
      </CardHeader>
      
      <CardBody>
        {loading && (
          <Alert status="info" mb={4} size="sm">
            <AlertIcon />
            <Text fontSize="sm">Updating monthly statistics...</Text>
          </Alert>
        )}

        <VStack spacing={4} align="stretch">
          {/* Key Metrics Grid */}
          <SimpleGrid columns={2} spacing={3}>
            <Tooltip label="New projects submitted this month" placement="top">
              <Box 
                bg="purple.50" 
                p={3} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="purple.200"
                cursor="help"
              >
                <HStack mb={1}>
                  <Icon as={FiFileText} color="purple.500" boxSize={4} />
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                    New Projects
                  </Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {newProjects}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {previousNewProjects} last month
                </Text>
              </Box>
            </Tooltip>

            <Tooltip label="Projects approved this month" placement="top">
              <Box 
                bg="green.50" 
                p={3} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor="green.200"
                cursor="help"
              >
                <HStack mb={1}>
                  <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
                  <Text fontSize="xs" color="gray.600" fontWeight="medium">
                    Approvals
                  </Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {approvals}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {rejections} rejected
                </Text>
              </Box>
            </Tooltip>
          </SimpleGrid>

          <Divider />

          {/* Detailed Metrics */}
          <VStack spacing={3} align="stretch">
            <Flex justify="space-between" w="full">
              <HStack>
                <Icon as={FiCheckCircle} color="blue.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Compliance Checks</Text>
              </HStack>
              <Badge colorScheme="blue">{complianceChecks}</Badge>
            </Flex>

            <Flex justify="space-between" w="full">
              <HStack>
                <Icon as={FiAlertCircle} color="orange.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Avg. Processing Time</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold">
                {avgProcessingTime > 0 ? `${avgProcessingTime.toFixed(1)} days` : 'N/A'}
              </Text>
            </Flex>

            <Flex justify="space-between" w="full">
              <HStack>
                <Icon as={FiDollarSign} color="green.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Funding Goal</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color="green.600">
                {formatMatic(totalFunding)}
              </Text>
            </Flex>

            <Flex justify="space-between" w="full">
              <HStack>
                <Icon as={FiTrendingUp} color="blue.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Raised This Month</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                {formatMatic(currentFunding)}
              </Text>
            </Flex>

            <Flex justify="space-between" w="full">
              <HStack>
                <Icon as={FiUsers} color="teal.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">New Contributors</Text>
              </HStack>
              <HStack>
                <Text fontSize="sm" fontWeight="semibold" color="teal.600">
                  {currentMonthContributors}
                </Text>
                <Badge colorScheme={isContributorGrowthPositive ? 'green' : 'red'} fontSize="2xs">
                  {isContributorGrowthPositive ? '+' : ''}{contributorGrowth}%
                </Badge>
              </HStack>
            </Flex>
          </VStack>

          <Divider />

          {/* Performance Summary */}
          <Box bg="gray.50" p={3} borderRadius="md">
            <Flex justify="space-between" w="full" mb={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Monthly Performance
              </Text>
              <HStack>
                <Icon 
                  as={isGrowthPositive ? FiTrendingUp : FiTrendingDown} 
                  color={isGrowthPositive ? 'green.500' : 'red.500'}
                />
                <Text 
                  fontSize="sm" 
                  fontWeight="bold" 
                  color={isGrowthPositive ? 'green.500' : 'red.500'}
                >
                  {platformGrowth}
                </Text>
              </HStack>
            </Flex>
            <Text fontSize="xs" color="gray.600">
              Project growth compared to {monthNames[previousMonth]} {previousYear}
            </Text>
          </Box>

          {/* Quick Stats */}
          <Box bg="purple.50" p={3} borderRadius="md">
            <Text fontSize="xs" fontWeight="semibold" color="purple.700" mb={2}>
              Performance Metrics
            </Text>
            <SimpleGrid columns={3} spacing={2} fontSize="xs">
              <Box textAlign="center">
                <Text fontWeight="bold" color="purple.600">
                  {newProjects > 0 ? ((approvals / newProjects) * 100).toFixed(0) : 0}%
                </Text>
                <Text color="gray.600">Approval Rate</Text>
              </Box>
              <Box textAlign="center">
                <Text fontWeight="bold" color="blue.600">
                  {monthlyStats?.currentMonthProjects.filter((p: Project) => p.status === 'under_review').length || 0}
                </Text>
                <Text color="gray.600">In Review</Text>
              </Box>
              <Box textAlign="center">
                <Text fontWeight="bold" color="orange.600">
                  {monthlyStats?.currentMonthProjects.filter((p: Project) => p.status === 'submitted').length || 0}
                </Text>
                <Text color="gray.600">Pending</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}