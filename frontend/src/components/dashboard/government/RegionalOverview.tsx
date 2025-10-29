import  contributionApi  from "@/lib/contributionApi";
import { useEffect, useMemo, useState } from "react";
import { FiMapPin, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import { Project, projectApi } from "@/lib/projectApi";

// ============================================
// FILE: components/dashboard/government/RegionalOverview.tsx
// ============================================
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Badge,
  HStack,
  Icon,
  Text,
  Box,
  Tooltip,
  Progress,
  Button,
  Spinner,
  useToast,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

interface RegionalOverviewProps {
  projects: Project[];
  onRefresh?: () => void;
}

interface RegionalData {
  region: string;
  projects: number;
  totalFunding: number;
  currentFunding: number;
  avgFunding: number;
  approvedProjects: number;
  pendingProjects: number;
  fundedProjects: number;
  farmers: Set<string>;
  approvalRate: number;
  fundingProgress: number;
  contributors: number;
}

export default function RegionalOverview({ projects, onRefresh }: RegionalOverviewProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [loading, setLoading] = useState(false);
  const [regionalContributions, setRegionalContributions] = useState<Map<string, number>>(new Map());
  const toast = useToast();

  // Fetch contribution data for each region
  useEffect(() => {
    fetchRegionalContributionData();
  }, [projects]);

  const fetchRegionalContributionData = async () => {
    try {
      setLoading(true);
      const contributionsMap = new Map<string, number>();

      // Get contributions for each project to calculate regional contributor counts
      for (const project of projects) {
        try {
          const region = project.location?.split(',')[0]?.trim() || 'Unknown';
          const contributionsResponse = await contributionApi.getProjectContributions(project._id);
          
          if (contributionsResponse.success && contributionsResponse.data) {
            const currentCount = contributionsMap.get(region) || 0;
            const projectContributors = contributionsResponse.data.contributorCount || 0;
            contributionsMap.set(region, currentCount + projectContributors);
          }
        } catch (error) {
          console.error(`Error fetching contributions for project ${project._id}:`, error);
        }
      }

      setRegionalContributions(contributionsMap);
    } catch (error: any) {
      console.error('Error fetching regional contribution data:', error);
      toast({
        title: 'Error loading contribution data',
        description: 'Some statistics may be incomplete',
        status: 'warning',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate regional statistics from projects
  const regionalData = useMemo(() => {
    const dataMap = new Map<string, RegionalData>();

    projects.forEach(project => {
      // Extract region from location (e.g., "Kigali, Rwanda" -> "Kigali")
      const region = project.location?.split(',')[0]?.trim() || 'Unknown';
      
      if (!dataMap.has(region)) {
        dataMap.set(region, {
          region,
          projects: 0,
          totalFunding: 0,
          currentFunding: 0,
          avgFunding: 0,
          approvedProjects: 0,
          pendingProjects: 0,
          fundedProjects: 0,
          farmers: new Set(),
          approvalRate: 0,
          fundingProgress: 0,
          contributors: regionalContributions.get(region) || 0,
        });
      }

      const data = dataMap.get(region)!;
      data.projects++;
      data.totalFunding += project.fundingGoal;
      data.currentFunding += project.currentFunding || 0;
      
      // Track project statuses
      if (project.status === 'active' || project.status === 'verified') {
        data.approvedProjects++;
      } else if (project.status === 'funded') {
        data.fundedProjects++;
        data.approvedProjects++; // Funded projects are also approved
      } else if (project.status === 'submitted' || project.status === 'under_review') {
        data.pendingProjects++;
      }

      // Track unique farmers
      const farmerId = typeof project.farmer === 'object' 
        ? project.farmer._id 
        : project.farmer;
      if (farmerId) {
        data.farmers.add(farmerId);
      }
    });

    // Calculate averages, rates, and progress
    const result = Array.from(dataMap.values()).map(data => {
      const fundingProgress = data.totalFunding > 0 
        ? (data.currentFunding / data.totalFunding) * 100 
        : 0;
      
      const approvalRate = data.projects > 0 
        ? Math.round((data.approvedProjects / data.projects) * 100) 
        : 0;

      return {
        ...data,
        avgFunding: data.projects > 0 ? data.totalFunding / data.projects : 0,
        approvalRate,
        fundingProgress,
        farmerCount: data.farmers.size,
        contributors: regionalContributions.get(data.region) || 0,
      };
    });

    // Sort by total funding (descending)
    return result.sort((a, b) => b.totalFunding - a.totalFunding);
  }, [projects, regionalContributions]);

  // Calculate totals
  const totals = useMemo(() => {
    return regionalData.reduce(
      (acc, data) => ({
        projects: acc.projects + data.projects,
        totalFunding: acc.totalFunding + data.totalFunding,
        currentFunding: acc.currentFunding + data.currentFunding,
        farmers: acc.farmers + data.farmerCount,
        contributors: acc.contributors + data.contributors,
        approvedProjects: acc.approvedProjects + data.approvedProjects,
        fundedProjects: acc.fundedProjects + data.fundedProjects,
      }),
      { 
        projects: 0, 
        totalFunding: 0, 
        currentFunding: 0, 
        farmers: 0, 
        contributors: 0,
        approvedProjects: 0,
        fundedProjects: 0,
      }
    );
  }, [regionalData]);

  const handleRefresh = () => {
    fetchRegionalContributionData();
    if (onRefresh) {
      onRefresh();
    }
    toast({
      title: 'Refreshing regional data...',
      status: 'info',
      duration: 2000,
    });
  };

  const formatMatic = (amount: number) => {
    return `${amount.toFixed(2)} MATIC`;
  };

  if (regionalData.length === 0) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiMapPin} color="purple.500" />
              <Heading size="md" color="purple.600">
                Regional Overview
              </Heading>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              isLoading={loading}
            >
              <FiRefreshCw />
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Icon as={FiMapPin} boxSize={12} color="gray.400" />
            <Text color="gray.500" textAlign="center">
              No regional data available yet
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center">
              Projects will appear here once they are submitted with location data
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Icon as={FiMapPin} color="purple.500" />
            <Heading size="md" color="purple.600">
              Regional Overview
            </Heading>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="purple" fontSize="sm">
              {regionalData.length} Regions
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

        {/* Quick Stats */}
        <HStack spacing={4} mt={3} fontSize="sm" flexWrap="wrap">
          <Badge colorScheme="blue" variant="subtle">
            📊 {totals.projects} Total Projects
          </Badge>
          <Badge colorScheme="green" variant="subtle">
            👥 {totals.farmers} Farmers
          </Badge>
          <Badge colorScheme="orange" variant="subtle">
            💰 {formatMatic(totals.totalFunding)} Goal
          </Badge>
          <Badge colorScheme="teal" variant="subtle">
            🤝 {totals.contributors} Contributors
          </Badge>
        </HStack>
      </CardHeader>
      
      <CardBody>
        {loading && (
          <Alert status="info" mb={4} size="sm">
            <AlertIcon />
            <Text fontSize="sm">Updating regional statistics...</Text>
          </Alert>
        )}

        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Region</Th>
                <Th isNumeric>Projects</Th>
                <Th isNumeric>Funding Goal</Th>
                <Th isNumeric>Raised</Th>
                <Th isNumeric>Farmers</Th>
                <Th isNumeric>Contributors</Th>
                <Th>Approval Rate</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {regionalData.map((data, index) => {
                const fundingPercentage = totals.totalFunding > 0 
                  ? (data.totalFunding / totals.totalFunding) * 100 
                  : 0;

                return (
                  <Tr key={index} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td fontWeight="medium">
                      <HStack>
                        <Icon as={FiMapPin} color="purple.400" boxSize={4} />
                        <Text>{data.region}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme="blue" fontSize="xs">
                        {data.projects}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Tooltip 
                        label={`${fundingPercentage.toFixed(1)}% of total platform funding`}
                        placement="top"
                      >
                        <Text fontWeight="medium" color="green.600">
                          {formatMatic(data.totalFunding)}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td isNumeric>
                      <Tooltip label={`${data.fundingProgress.toFixed(1)}% of regional goal`}>
                        <Text fontSize="sm" color="blue.600" fontWeight="medium">
                          {formatMatic(data.currentFunding)}
                        </Text>
                      </Tooltip>
                      <Progress
                        value={data.fundingProgress}
                        size="xs"
                        colorScheme={
                          data.fundingProgress >= 80 ? 'green' :
                          data.fundingProgress >= 40 ? 'orange' : 'red'
                        }
                        borderRadius="full"
                        mt={1}
                      />
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme="purple" variant="subtle">
                        {data.farmerCount}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme="teal" variant="subtle">
                        {data.contributors}
                      </Badge>
                    </Td>
                    <Td>
                      <Tooltip 
                        label={`${data.approvedProjects} approved out of ${data.projects} total`}
                        placement="top"
                      >
                        <Box w="80px">
                          <HStack spacing={2} mb={1}>
                            <Text fontSize="xs" fontWeight="bold" color={
                              data.approvalRate >= 70 ? 'green.600' :
                              data.approvalRate >= 40 ? 'orange.600' : 'red.600'
                            }>
                              {data.approvalRate}%
                            </Text>
                          </HStack>
                          <Progress
                            value={data.approvalRate}
                            size="xs"
                            colorScheme={
                              data.approvalRate >= 70 ? 'green' :
                              data.approvalRate >= 40 ? 'orange' : 'red'
                            }
                            borderRadius="full"
                          />
                        </Box>
                      </Tooltip>
                    </Td>
                    <Td>
                      <VStack spacing={1} align="start">
                        {data.approvedProjects > 0 && (
                          <Tooltip label={`${data.approvedProjects} approved`}>
                            <Badge colorScheme="green" fontSize="2xs">
                              ✅ {data.approvedProjects}
                            </Badge>
                          </Tooltip>
                        )}
                        {data.pendingProjects > 0 && (
                          <Tooltip label={`${data.pendingProjects} pending`}>
                            <Badge colorScheme="orange" fontSize="2xs">
                              ⏳ {data.pendingProjects}
                            </Badge>
                          </Tooltip>
                        )}
                        {data.fundedProjects > 0 && (
                          <Tooltip label={`${data.fundedProjects} fully funded`}>
                            <Badge colorScheme="purple" fontSize="2xs">
                              🎯 {data.fundedProjects}
                            </Badge>
                          </Tooltip>
                        )}
                      </VStack>
                    </Td>
                  </Tr>
                );
              })}
              
              {/* Totals Row */}
              <Tr bg={useColorModeValue('purple.50', 'gray.700')} fontWeight="bold">
                <Td>
                  <HStack>
                    <Icon as={FiTrendingUp} color="purple.500" />
                    <Text>TOTAL</Text>
                  </HStack>
                </Td>
                <Td isNumeric>
                  <Badge colorScheme="purple">
                    {totals.projects}
                  </Badge>
                </Td>
                <Td isNumeric color="green.600">
                  {formatMatic(totals.totalFunding)}
                </Td>
                <Td isNumeric color="blue.600">
                  {formatMatic(totals.currentFunding)}
                </Td>
                <Td isNumeric>
                  <Badge colorScheme="purple">
                    {totals.farmers}
                  </Badge>
                </Td>
                <Td isNumeric>
                  <Badge colorScheme="teal">
                    {totals.contributors}
                  </Badge>
                </Td>
                <Td colSpan={2}>
                  <Text fontSize="xs" color="gray.600">
                    Platform Progress: {((totals.currentFunding / totals.totalFunding) * 100).toFixed(1)}%
                  </Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        {/* Summary Stats */}
        <Box mt={4} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <HStack justify="space-around" fontSize="sm" flexWrap="wrap" spacing={4}>
            <Box textAlign="center">
              <Text color="gray.600" fontSize="xs">Top Region</Text>
              <Text fontWeight="bold" color="purple.600">
                {regionalData[0]?.region}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {regionalData[0]?.projects} projects
              </Text>
            </Box>
            <Box textAlign="center">
              <Text color="gray.600" fontSize="xs">Highest Funding Goal</Text>
              <Text fontWeight="bold" color="green.600">
                {formatMatic(Math.max(...regionalData.map(d => d.totalFunding)))}
              </Text>
            </Box>
            <Box textAlign="center">
              <Text color="gray.600" fontSize="xs">Most Contributors</Text>
              <Text fontWeight="bold" color="teal.600">
                {Math.max(...regionalData.map(d => d.contributors))}
              </Text>
            </Box>
            <Box textAlign="center">
              <Text color="gray.600" fontSize="xs">Avg. Per Region</Text>
              <Text fontWeight="bold" color="blue.600">
                {(totals.projects / regionalData.length).toFixed(1)} projects
              </Text>
            </Box>
          </HStack>
        </Box>
      </CardBody>
    </Card>
  );
}