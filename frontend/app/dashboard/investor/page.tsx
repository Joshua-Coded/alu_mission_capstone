"use client";
import ContributorSidebar from "@/components/dashboard/contributor/ContributorSidebar";
import ProjectCard from "@/components/dashboard/farmer/ProjectCard";
import RouteGuard from "@/components/RouteGuard";
import TopHeader from "@/components/dashboard/contributor/TopHeader";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";
import WalletSync from "@/components/WalletSync";
import contributionApi from "@/lib/contributionApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiDollarSign, FiHeart, FiRefreshCw, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { projectApi } from "@/lib/projectApi";

import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  Badge,
  Text,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Icon,
  Progress,
  useToast,
  Spinner,
  HStack,
  Link,
} from '@chakra-ui/react';

interface DashboardStats {
  totalContributions: number;
  totalAmountMatic: number;
  projectsSupported: number;
  activeProjects: number;
  confirmedContributions: number;
  pendingContributions: number;
  averageContribution: number;
}

export default function InvestorDashboard() {
  const { user, logout } = useAuth();
  const { address } = useAccount();
  const router = useRouter();
  const toast = useToast();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [stats, setStats] = useState<DashboardStats>({
    totalContributions: 0,
    totalAmountMatic: 0,
    projectsSupported: 0,
    activeProjects: 0,
    confirmedContributions: 0,
    pendingContributions: 0,
    averageContribution: 0,
  });
  

  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch contribution stats
      try {
        const statsResult = await contributionApi.getMyStats();
        console.log('📊 Stats Result:', statsResult);
        
        if (statsResult.success && statsResult.data) {
          const data = statsResult.data;
          setStats({
            totalContributions: data.totalContributions || 0,
            totalAmountMatic: data.totalAmountMatic || 0,
            projectsSupported: data.projectsSupported || 0,
            activeProjects: 0,
            confirmedContributions: data.confirmedContributions || 0,
            pendingContributions: data.pendingContributions || 0,
            averageContribution: data.averageContribution || 0, 
          });
          console.log('✅ Stats set:', {
            totalAmountMatic: data.totalAmountMatic,
            totalContributions: data.totalContributions,
            projectsSupported: data.projectsSupported
          });
        } else {
          console.log('❌ No stats data in response');
        }
      } catch (err: any) {
        console.log('❌ Stats API error:', err.message);
      }

      // If stats are still 0, try fetching contributions directly
      if (stats.totalAmountMatic === 0) {
        await fetchContributionsDirectly();
      }

      // Fetch recent contributions
      try {
        const contributionsResult = await contributionApi.getMyContributions(1, 5);
        console.log('📝 Contributions Result:', contributionsResult);
        
        if (contributionsResult.success && contributionsResult.data) {
          const contributions = contributionsResult.data.contributions || [];
          setRecentContributions(contributions);
          
          // If we still don't have stats, calculate from contributions
          if (stats.totalAmountMatic === 0 && contributions.length > 0) {
            const totalMatic = contributions.reduce((sum: number, contribution: any) => {
              return sum + (contribution.amountMatic || contribution.amount || 0);
            }, 0);
            
            const uniqueProjects = new Set(contributions.map((c: any) => c.project?._id)).size;
            
            console.log('💰 Calculated from contributions:', {
              totalMatic,
              totalContributions: contributions.length,
              uniqueProjects
            });
            
            setStats(prev => ({
              ...prev,
              totalAmountMatic: totalMatic,
              totalContributions: contributions.length,
              projectsSupported: uniqueProjects,
            }));
          }
        }
      } catch (err: any) {
        console.log('❌ Could not fetch recent contributions:', err.message);
      }
      
      // Fetch projects
      try {
        const projects = await projectApi.getVerifiedProjects();
        const activeProjects = projects.filter((p: any) => p.status === 'active');
        
        setStats(prev => ({
          ...prev,
          activeProjects: activeProjects.length,
        }));
        
        setRecentProjects(activeProjects.slice(0, 6));
      } catch (err: any) {
        console.log('❌ Could not fetch projects:', err.message);
        setRecentProjects([]);
      }
    } catch (err: any) {
      console.error('❌ Error loading dashboard:', err);
      toast({
        title: 'Error Loading Dashboard',
        description: 'Some data could not be loaded. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchContributionsDirectly = async () => {
    try {
      console.log('🔄 Trying alternative: Loading all contributions...');
      const contributionsResult = await contributionApi.getMyContributions(1, 100);
      
      console.log('📊 All Contributions Response:', contributionsResult);
      
      if (contributionsResult.success && contributionsResult.data) {
        const contributions = contributionsResult.data.contributions || [];
        const totalMatic = contributions.reduce((sum: number, contribution: any) => {
          return sum + (contribution.amountMatic || contribution.amount || 0);
        }, 0);
        
        const uniqueProjects = new Set(contributions.map((c: any) => c.project?._id)).size;
        const confirmedContributions = contributions.filter((c: any) => c.status === 'confirmed').length;
        const pendingContributions = contributions.filter((c: any) => c.status === 'pending').length;
        
        console.log('💰 Calculated totals:', {
          totalMatic,
          totalContributions: contributions.length,
          uniqueProjects,
          confirmedContributions,
          pendingContributions
        });
        
        if (totalMatic > 0) {
          setStats(prev => ({
            ...prev,
            totalAmountMatic: totalMatic,
            totalContributions: contributions.length,
            projectsSupported: uniqueProjects,
            confirmedContributions,
            pendingContributions,
          }));
        }
      }
    } catch (error) {
      console.error('❌ Alternative approach failed:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast({
      title: 'Dashboard Refreshed',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const formatMatic = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0.0000';
    }
    if (amount === 0) return '0.0000';
    if (amount < 0.0001) return '< 0.0001';
    return amount.toFixed(4);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleViewProject = (project: any) => {
    router.push(`/projects/${project._id}`);
  };

  const getProgressPercentage = () => {
    if (stats.totalContributions === 0) return 0;
    const total = stats.confirmedContributions + stats.pendingContributions;
    if (total === 0) return 0;
    return (stats.confirmedContributions / total) * 100;
  };

  return (
    <RouteGuard allowedRoles={['INVESTOR']}>
      <WalletConnectionGuard 
        title="Connect Wallet to Investor Dashboard"
        description="Connect your wallet to invest in agricultural projects and support farmers with blockchain-secured funding."
      >
        <WalletSync />
        
        <Box minH="100vh" bg={bgColor}>
          <ContributorSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
          
          <TopHeader
            user={user}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          <Box 
            ml={sidebarCollapsed ? '70px' : '280px'}
            transition="margin-left 0.3s ease"
            pt="80px"
            pb={8}
            px={6}
            minH="100vh"
            w={`calc(100% - ${sidebarCollapsed ? '70px' : '280px'})`}
          >
            <Container maxW="7xl" p={0}>
              {loading ? (
                <VStack spacing={4} py={20}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text color="gray.600">Loading investor dashboard...</Text>
                </VStack>
              ) : (
                <VStack spacing={8} align="stretch">
                  {/* Welcome Header with Refresh */}
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading size="lg" mb={2}>Welcome back, {user?.firstName}! 👋</Heading>
                      <Text color="gray.600">Here's an overview of your investment portfolio</Text>
                    </Box>
                    <Button
                      leftIcon={<Icon as={FiRefreshCw} />}
                      variant="outline"
                      onClick={handleRefresh}
                      isLoading={refreshing}
                      size="sm"
                    >
                      Refresh
                    </Button>
                  </Flex>

                  {/* Stats Grid */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Card bg={cardBg} shadow="sm" borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <Stat>
                          <Flex justify="space-between" align="start">
                            <VStack align="start" spacing={2}>
                              <StatLabel color="gray.600" fontSize="sm">Total Investments</StatLabel>
                              <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                                {formatCompactNumber(stats.totalContributions)}
                              </StatNumber>
                              <Text fontSize="xs" color="gray.500">
                                {stats.confirmedContributions} confirmed
                              </Text>
                            </VStack>
                            <Icon as={FiDollarSign} boxSize={6} color="blue.500" bg="blue.100" p={2} borderRadius="md" />
                          </Flex>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="sm" borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <Stat>
                          <Flex justify="space-between" align="start">
                            <VStack align="start" spacing={2}>
                              <StatLabel color="gray.600" fontSize="sm">Total Invested</StatLabel>
                              <HStack spacing={1}>
                                <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
                                  {formatMatic(stats.totalAmountMatic)}
                                </StatNumber>
                                <Text fontSize="lg" color="purple.500" fontWeight="bold">MATIC</Text>
                              </HStack>
                              {stats.averageContribution > 0 && (
                                <Text fontSize="xs" color="gray.500">
                                  Avg: {formatMatic(stats.averageContribution)}
                                </Text>
                              )}
                            </VStack>
                            <Icon as={FiTrendingUp} boxSize={6} color="green.500" bg="green.100" p={2} borderRadius="md" />
                          </Flex>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="sm" borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <Stat>
                          <Flex justify="space-between" align="start">
                            <VStack align="start" spacing={2}>
                              <StatLabel color="gray.600" fontSize="sm">Projects Funded</StatLabel>
                              <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
                                {formatCompactNumber(stats.projectsSupported)}
                              </StatNumber>
                              <Text fontSize="xs" color="gray.500">
                                Active investments
                              </Text>
                            </VStack>
                            <Icon as={FiUsers} boxSize={6} color="purple.500" bg="purple.100" p={2} borderRadius="md" />
                          </Flex>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="sm" borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <Stat>
                          <Flex justify="space-between" align="start">
                            <VStack align="start" spacing={2}>
                              <StatLabel color="gray.600" fontSize="sm">Active Opportunities</StatLabel>
                              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.600">
                                {stats.activeProjects}
                              </StatNumber>
                              <Text fontSize="xs" color="gray.500">
                                Available to invest
                              </Text>
                            </VStack>
                            <Icon as={FiHeart} boxSize={6} color="orange.500" bg="orange.100" p={2} borderRadius="md" />
                          </Flex>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Transaction Status */}
                  {stats.pendingContributions > 0 && (
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="medium" color="gray.700">
                              Transaction Status
                            </Text>
                            <Badge colorScheme="yellow" fontSize="xs">
                              {stats.pendingContributions} pending
                            </Badge>
                          </Flex>
                          <Progress 
                            value={getProgressPercentage()} 
                            size="lg" 
                            colorScheme="green" 
                            borderRadius="full"
                            hasStripe
                            isAnimated
                          />
                          <Flex justify="space-between" fontSize="sm" color="gray.600">
                            <Text>
                              {stats.confirmedContributions} confirmed
                            </Text>
                            <Text>
                              {Math.round(getProgressPercentage())}% complete
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Card 
                      bg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                      color="white"
                      cursor="pointer"
                      onClick={() => router.push('/projects/active')}
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="md">Browse Projects</Heading>
                            <Text fontSize="sm" opacity={0.9}>Find investment opportunities</Text>
                          </VStack>
                          <Text fontSize="3xl">→</Text>
                        </Flex>
                      </CardBody>
                    </Card>

                    <Card 
                      bg="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                      color="white"
                      cursor="pointer"
                      onClick={() => router.push('/contributions/history')}
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="md">My Portfolio</Heading>
                            <Text fontSize="sm" opacity={0.9}>View investment history</Text>
                          </VStack>
                          <Text fontSize="3xl">→</Text>
                        </Flex>
                      </CardBody>
                    </Card>

                    <Card 
                      bg="linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"
                      color="white"
                      cursor="pointer"
                      onClick={() => router.push('/projects/favorites')}
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="md">Watchlist</Heading>
                            <Text fontSize="sm" opacity={0.9}>Track favorite projects</Text>
                          </VStack>
                          <Text fontSize="3xl">→</Text>
                        </Flex>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Recent Investments */}
                  {recentContributions.length > 0 && (
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <Flex justify="space-between" align="center" mb={6}>
                          <VStack align="start" spacing={1}>
                            <Heading size="md">Recent Investments</Heading>
                            <Text fontSize="sm" color="gray.600">
                              Total: {formatMatic(stats.totalAmountMatic)} MATIC
                            </Text>
                          </VStack>
                          <Button 
                            variant="link" 
                            colorScheme="blue" 
                            size="sm"
                            onClick={() => router.push('/contributions/history')}
                          >
                            View All →
                          </Button>
                        </Flex>

                        <VStack spacing={4} align="stretch">
                          {recentContributions.map((contribution) => (
                            <Flex
                              key={contribution._id}
                              justify="space-between"
                              align="center"
                              p={4}
                              bg={useColorModeValue('gray.50', 'gray.700')}
                              borderRadius="lg"
                              _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                              transition="all 0.2s"
                              cursor="pointer"
                              onClick={() => router.push(`/projects/${contribution.project._id}`)}
                            >
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                  {contribution.project?.title || 'Unknown Project'}
                                </Text>
                                <HStack spacing={2}>
                                  <Text fontWeight="bold" color="purple.600">
                                    {formatMatic(contribution.amountMatic || contribution.amount)}
                                  </Text>
                                  <Text fontSize="sm" color="purple.500" fontWeight="bold">MATIC</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500">
                                  {new Date(contribution.contributedAt || contribution.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </Text>
                              </VStack>
                              <Badge
                                colorScheme={
                                  contribution.status === 'confirmed' ? 'green' :
                                  contribution.status === 'pending' ? 'yellow' : 'red'
                                }
                                px={3}
                                py={1}
                                borderRadius="full"
                                textTransform="capitalize"
                                fontSize="xs"
                              >
                                {contribution.status}
                              </Badge>
                            </Flex>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  {/* Investment Opportunities */}
                  <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <Flex justify="space-between" align="center" mb={6}>
                        <Heading size="md">Investment Opportunities</Heading>
                        <Button 
                          variant="link" 
                          colorScheme="blue" 
                          size="sm"
                          onClick={() => router.push('/projects/active')}
                        >
                          View All →
                        </Button>
                      </Flex>

                      {recentProjects.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                          {recentProjects.map((project) => (
                            <ProjectCard
                              key={project._id}
                              project={project}
                              onViewDetails={handleViewProject}
                              showBlockchainInfo={true}
                            />
                          ))}
                        </SimpleGrid>
                      ) : (
                        <VStack spacing={4} py={12}>
                          <Icon as={FiUsers} boxSize={12} color="gray.400" />
                          <Text color="gray.600">No projects available</Text>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Check back later for new investment opportunities
                          </Text>
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </Container>
          </Box>
        </Box>
      </WalletConnectionGuard>
    </RouteGuard>
  );
}