// ============================================
// FILE: components/dashboard/government/GovDashboardStats.tsx
// Enhanced version with more visual appeal
// ============================================
import {
  SimpleGrid,
  Box,
  Card,
  CardBody,
  Icon,
  HStack,
  Badge,
  Tooltip,
  useColorModeValue,
  VStack,
  Text,
  Progress,
} from '@chakra-ui/react';
import {
  FiFileText,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';

interface GovDashboardStatsProps {
  totalProjects: number;
  pendingReview: number;
  underReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  averageProcessingTime: string;
  todaySubmissions: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  tooltip?: string;
  badge?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  showProgress?: boolean;
  total?: number;
}

function StatCard({
  label,
  value,
  icon,
  color,
  tooltip,
  badge,
  trend,
  showProgress,
  total,
}: StatCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const percentage = total ? Math.round((Number(value) / total) * 100) : 0;

  return (
    <Tooltip label={tooltip} placement="top" hasArrow isDisabled={!tooltip}>
      <Card
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          shadow: 'lg',
          borderColor: `${color}.300`,
        }}
        cursor="pointer"
      >
        <CardBody>
          <HStack spacing={4} align="start">
            <Box
              p={3}
              borderRadius="lg"
              bg={`${color}.50`}
              color={`${color}.500`}
            >
              <Icon as={icon} boxSize={6} />
            </Box>

            <VStack align="start" spacing={1} flex={1}>
              <HStack>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {label}
                </Text>
                {badge}
              </HStack>

              <Text
                fontSize="3xl"
                fontWeight="bold"
                color={`${color}.600`}
              >
                {value}
              </Text>

              {trend && (
                <HStack spacing={1} fontSize="sm">
                  <Icon
                    as={trend.isPositive ? FiTrendingUp : FiTrendingDown}
                    color={trend.isPositive ? 'green.500' : 'red.500'}
                    boxSize={4}
                  />
                  <Text
                    color={trend.isPositive ? 'green.600' : 'red.600'}
                    fontWeight="medium"
                  >
                    {trend.value}%
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    vs last month
                  </Text>
                </HStack>
              )}

              {showProgress && total && (
                <Box w="full" mt={2}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" color="gray.600">
                      Progress
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color={`${color}.600`}>
                      {percentage}%
                    </Text>
                  </HStack>
                  <Progress
                    value={percentage}
                    colorScheme={color}
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
              )}
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </Tooltip>
  );
}

export default function GovDashboardStats({
  totalProjects,
  pendingReview,
  underReview,
  approved,
  rejected,
  needsRevision,
  averageProcessingTime,
  todaySubmissions,
}: GovDashboardStatsProps) {
  const approvalRate = totalProjects > 0 
    ? Math.round((approved / totalProjects) * 100) 
    : 0;

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: FiFileText,
      color: 'purple',
      tooltip: 'All projects submitted to the platform',
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      label: 'Pending Review',
      value: pendingReview,
      icon: FiClock,
      color: 'orange',
      tooltip: 'Projects awaiting initial review',
      badge: todaySubmissions > 0 && (
        <Badge colorScheme="orange" fontSize="xs">
          +{todaySubmissions} today
        </Badge>
      ),
    },
    {
      label: 'Under Review',
      value: underReview,
      icon: FiActivity,
      color: 'blue',
      tooltip: 'Projects currently being reviewed',
      showProgress: true,
      total: totalProjects,
    },
    {
      label: 'Approved',
      value: approved,
      icon: FiCheckCircle,
      color: 'green',
      tooltip: 'Projects approved and active',
      trend: {
        value: 8,
        isPositive: true,
      },
      showProgress: true,
      total: totalProjects,
    },
    {
      label: 'Rejected',
      value: rejected,
      icon: FiXCircle,
      color: 'red',
      tooltip: 'Projects that were rejected',
      showProgress: true,
      total: totalProjects,
    },
    {
      label: 'Needs Revision',
      value: needsRevision,
      icon: FiAlertCircle,
      color: 'yellow',
      tooltip: 'Projects requiring farmer revisions',
    },
  ];

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </SimpleGrid>

      {/* Summary Card */}
      <Card mt={6} bg={useColorModeValue('purple.50', 'gray.800')} borderWidth="1px">
        <CardBody>
          <HStack justify="space-around" flexWrap="wrap" gap={4}>
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {approvalRate}%
              </Text>
              <Text fontSize="sm" color="gray.600">
                Approval Rate
              </Text>
            </VStack>

            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {averageProcessingTime}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Avg. Processing
              </Text>
            </VStack>

            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {todaySubmissions}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Today's Submissions
              </Text>
            </VStack>

            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {pendingReview + underReview}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Action Required
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}