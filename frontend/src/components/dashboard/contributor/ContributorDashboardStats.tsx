// ============================================
// FILE: components/contributor/ContributorDashboardStats.tsx
// ============================================
import {
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Flex,
    Box,
    Icon,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { 
    FiDollarSign, 
    FiTarget, 
    FiCheckCircle, 
    FiHeart,
  } from 'react-icons/fi';
  
  interface ContributorDashboardStatsProps {
    totalContributed: number;
    activeProjects: number;
    completedProjects: number;
    livesImpacted: number;
  }
  
  export default function ContributorDashboardStats(props: ContributorDashboardStatsProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    const stats = [
      {
        label: 'Total Contributed',
        value: `$${props.totalContributed.toLocaleString()}`,
        icon: FiDollarSign,
        color: 'green',
        subtext: 'Impact-based funding',
      },
      {
        label: 'Active Projects',
        value: props.activeProjects,
        icon: FiTarget,
        color: 'blue',
        subtext: 'Currently supporting',
      },
      {
        label: 'Completed Projects',
        value: props.completedProjects,
        icon: FiCheckCircle,
        color: 'purple',
        subtext: 'Successfully funded',
      },
      {
        label: 'Lives Impacted',
        value: props.livesImpacted,
        icon: FiHeart,
        color: 'pink',
        subtext: 'Communities helped',
      },
    ];
  
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {stats.map((stat, index) => (
          <Card key={index} bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="start">
                  <Box flex="1">
                    <StatLabel fontSize="sm" color="gray.500" mb={1}>
                      {stat.label}
                    </StatLabel>
                    <StatNumber fontSize="2xl" color={`${stat.color}.500`} mb={1}>
                      {stat.value}
                    </StatNumber>
                    <StatHelpText fontSize="xs" mb={0}>
                      {stat.subtext}
                    </StatHelpText>
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
  