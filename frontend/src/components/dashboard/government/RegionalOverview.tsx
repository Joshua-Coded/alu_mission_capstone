import { useMemo } from "react";
import { FiMapPin, FiTrendingUp } from "react-icons/fi";
import { Project } from "@/lib/projectApi";

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
} from '@chakra-ui/react';

interface RegionalOverviewProps {
  projects: Project[];
}

interface RegionalData {
  region: string;
  projects: number;
  totalFunding: number;
  avgFunding: number;
  approvedProjects: number;
  pendingProjects: number;
  farmers: Set<string>; // Unique farmer IDs
  approvalRate: number;
}

export default function RegionalOverview({ projects }: RegionalOverviewProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
          avgFunding: 0,
          approvedProjects: 0,
          pendingProjects: 0,
          farmers: new Set(),
          approvalRate: 0,
        });
      }

      const data = dataMap.get(region)!;
      data.projects++;
      data.totalFunding += project.fundingGoal;
      
      if (project.status === 'active' || project.status === 'funded') {
        data.approvedProjects++;
      }
      
      if (project.status === 'submitted' || project.status === 'under_review') {
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

    // Calculate averages and rates
    const result = Array.from(dataMap.values()).map(data => ({
      ...data,
      avgFunding: data.projects > 0 ? data.totalFunding / data.projects : 0,
      approvalRate: data.projects > 0 
        ? Math.round((data.approvedProjects / data.projects) * 100) 
        : 0,
      farmerCount: data.farmers.size,
    }));

    // Sort by total projects (descending)
    return result.sort((a, b) => b.projects - a.projects);
  }, [projects]);

  // Calculate totals
  const totals = useMemo(() => {
    return regionalData.reduce(
      (acc, data) => ({
        projects: acc.projects + data.projects,
        funding: acc.funding + data.totalFunding,
        farmers: acc.farmers + data.farmerCount,
      }),
      { projects: 0, funding: 0, farmers: 0 }
    );
  }, [regionalData]);

  if (regionalData.length === 0) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <Icon as={FiMapPin} color="purple.500" />
            <Heading size="md" color="purple.600">
              Regional Overview
            </Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" textAlign="center" py={8}>
            No regional data available yet
          </Text>
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
          <Badge colorScheme="purple" fontSize="sm">
            {regionalData.length} Regions
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Region</Th>
                <Th isNumeric>Projects</Th>
                <Th isNumeric>Total Funding</Th>
                <Th isNumeric>Avg. Funding</Th>
                <Th isNumeric>Farmers</Th>
                <Th>Approval Rate</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {regionalData.map((data, index) => {
                const fundingPercentage = totals.funding > 0 
                  ? (data.totalFunding / totals.funding) * 100 
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
                        label={`${fundingPercentage.toFixed(1)}% of total funding`}
                        placement="top"
                      >
                        <Text fontWeight="medium" color="green.600">
                          ${data.totalFunding.toLocaleString()}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td isNumeric>
                      <Text fontSize="sm" color="gray.600">
                        ${data.avgFunding.toLocaleString()}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme="purple" variant="subtle">
                        {data.farmerCount}
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
                      <HStack spacing={1}>
                        {data.approvedProjects > 0 && (
                          <Tooltip label={`${data.approvedProjects} approved`}>
                            <Badge colorScheme="green" fontSize="xs">
                              {data.approvedProjects}
                            </Badge>
                          </Tooltip>
                        )}
                        {data.pendingProjects > 0 && (
                          <Tooltip label={`${data.pendingProjects} pending`}>
                            <Badge colorScheme="orange" fontSize="xs">
                              {data.pendingProjects}
                            </Badge>
                          </Tooltip>
                        )}
                      </HStack>
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
                  ${totals.funding.toLocaleString()}
                </Td>
                <Td isNumeric color="gray.600">
                  ${(totals.funding / totals.projects).toLocaleString()}
                </Td>
                <Td isNumeric>
                  <Badge colorScheme="purple">
                    {totals.farmers}
                  </Badge>
                </Td>
                <Td colSpan={2}>
                  <Text fontSize="xs" color="gray.600">
                    Across {regionalData.length} regions
                  </Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        {/* Summary Stats */}
        <Box mt={4} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <HStack justify="space-around" fontSize="sm">
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
              <Text color="gray.600" fontSize="xs">Highest Funding</Text>
              <Text fontWeight="bold" color="green.600">
                ${Math.max(...regionalData.map(d => d.totalFunding)).toLocaleString()}
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