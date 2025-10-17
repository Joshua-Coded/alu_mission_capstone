import { Project } from "@/lib/projectApi";

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
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCheckCircle, 
  FiFileText,
  FiAlertCircle,
  FiCalendar,
} from 'react-icons/fi';

interface MonthlySummaryProps {
  projects: Project[];
}

export default function MonthlySummary({ projects }: MonthlySummaryProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Calculate current month metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filter projects by month
  const currentMonthProjects = projects.filter(p => {
    const date = new Date(p.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const previousMonthProjects = projects.filter(p => {
    const date = new Date(p.createdAt);
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
  });

  // Calculate metrics
  const newProjects = currentMonthProjects.length;
  const previousNewProjects = previousMonthProjects.length;
  const projectGrowth = previousNewProjects > 0 
    ? (((newProjects - previousNewProjects) / previousNewProjects) * 100).toFixed(1)
    : '0';

  // Compliance checks (due diligence completed this month)
  const complianceChecks = currentMonthProjects.filter(p => 
    p.dueDiligence?.status === 'completed' ||
    p.dueDiligence?.completedAt && 
    new Date(p.dueDiligence.completedAt).getMonth() === currentMonth
  ).length;

  // Approvals this month
  const approvals = currentMonthProjects.filter(p => 
    p.status === 'active' || p.status === 'funded'
  ).length;

  // Rejections this month
  const rejections = currentMonthProjects.filter(p => 
    p.status === 'rejected'
  ).length;

  // Average processing time (in days)
  const completedProjects = currentMonthProjects.filter(p => 
    p.status === 'active' || p.status === 'rejected'
  );
  
  const avgProcessingTime = completedProjects.length > 0
    ? completedProjects.reduce((sum, p) => {
        const start = new Date(p.submittedAt || p.createdAt);
        const end = new Date(p.verification?.verifiedAt || p.updatedAt);
        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / completedProjects.length
    : 0;

  // Total funding this month
  const totalFunding = currentMonthProjects
    .filter(p => p.status === 'active' || p.status === 'funded')
    .reduce((sum, p) => sum + p.fundingGoal, 0);

  // Platform growth percentage
  const platformGrowth = parseFloat(projectGrowth) >= 0 
    ? `+${projectGrowth}%` 
    : `${projectGrowth}%`;

  const isGrowthPositive = parseFloat(projectGrowth) >= 0;

  // Get current month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentMonth];

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
      <CardHeader>
        <HStack justify="space-between">
          <Box>
            <Heading size="md" color="purple.600">
              Monthly Summary
            </Heading>
            <HStack mt={1} spacing={2}>
              <Icon as={FiCalendar} color="gray.500" boxSize={3} />
              <Text fontSize="xs" color="gray.500">
                {currentMonthName} {currentYear}
              </Text>
            </HStack>
          </Box>
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
        </HStack>
      </CardHeader>
      <CardBody>
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
                <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Total Funding Goal</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color="green.600">
                ${totalFunding.toLocaleString()}
              </Text>
            </Flex>
          </VStack>

          <Divider />

          {/* Platform Growth Summary */}
          <Box bg="gray.50" p={3} borderRadius="md">
            <Flex justify="space-between" w="full" mb={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Platform Growth
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
              Compared to {monthNames[previousMonth]} {previousYear}
            </Text>
          </Box>

          {/* Quick Stats */}
          <Box bg="purple.50" p={3} borderRadius="md">
            <Text fontSize="xs" fontWeight="semibold" color="purple.700" mb={2}>
              Quick Stats
            </Text>
            <SimpleGrid columns={3} spacing={2} fontSize="xs">
              <Box textAlign="center">
                <Text fontWeight="bold" color="purple.600">
                  {((approvals / (newProjects || 1)) * 100).toFixed(0)}%
                </Text>
                <Text color="gray.600">Approval Rate</Text>
              </Box>
              <Box textAlign="center">
                <Text fontWeight="bold" color="blue.600">
                  {currentMonthProjects.filter(p => p.status === 'under_review').length}
                </Text>
                <Text color="gray.600">In Review</Text>
              </Box>
              <Box textAlign="center">
                <Text fontWeight="bold" color="orange.600">
                  {currentMonthProjects.filter(p => p.status === 'submitted').length}
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