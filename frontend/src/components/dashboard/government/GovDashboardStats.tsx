// ============================================
// FILE: components/government/GovDashboardStats.tsx
// ============================================
import {
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    Flex,
    Box,
    Icon,
    useColorModeValue,
    Badge,
    Text,
  } from '@chakra-ui/react';
  import { 
    FiFileText, 
    FiClock, 
    FiCheckCircle, 
    FiAlertTriangle,
    FiTrendingUp,
    FiUsers
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
  
  export default function GovDashboardStats(props: GovDashboardStatsProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    const stats = [
      {
        label: 'Total Submissions',
        value: props.totalProjects,
        icon: FiFileText,
        color: 'purple',
        subtext: `+${props.todaySubmissions} today`,
        change: '+12%'
      },
      {
        label: 'Pending Review',
        value: props.pendingReview,
        icon: FiClock,
        color: 'orange',
        subtext: 'Requires action',
        urgent: props.pendingReview > 10
      },
      {
        label: 'Under Review',
        value: props.underReview,
        icon: FiUsers,
        color: 'blue',
        subtext: 'In progress'
      },
      {
        label: 'Approved',
        value: props.approved,
        icon: FiCheckCircle,
        color: 'green',
        subtext: 'This month',
        change: '+8%'
      },
      {
        label: 'Needs Revision',
        value: props.needsRevision,
        icon: FiAlertTriangle,
        color: 'yellow',
        subtext: 'Waiting on farmer'
      },
      {
        label: 'Avg. Processing',
        value: props.averageProcessingTime,
        icon: FiTrendingUp,
        color: 'teal',
        subtext: 'Target: 7 days',
        change: '-15%'
      },
    ];
  
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={4}>
        {stats.map((stat, index) => (
          <Card key={index} bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="start">
                  <Box flex="1">
                    <StatLabel fontSize="xs" color="gray.500" mb={1}>
                      {stat.label}
                    </StatLabel>
                    <StatNumber fontSize="2xl" color={`${stat.color}.500`} mb={1}>
                      {stat.value}
                    </StatNumber>
                    <Text fontSize="xs" color="gray.500">
                      {stat.subtext}
                    </Text>
                    {stat.change && (
                      <Badge colorScheme={stat.color} mt={2} fontSize="xs">
                        {stat.change}
                      </Badge>
                    )}
                    {stat.urgent && (
                      <Badge colorScheme="red" mt={2} fontSize="xs">
                        Action needed
                      </Badge>
                    )}
                  </Box>
                  <Icon as={stat.icon} boxSize={6} color={`${stat.color}.400`} />
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }