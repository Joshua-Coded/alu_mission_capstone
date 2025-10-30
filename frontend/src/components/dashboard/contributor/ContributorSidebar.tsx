"use client";
import NextLink from "next/link";
import React, { useEffect, useState } from "react";
import contributionApi from "@/lib/contributionApi";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Badge,
  Avatar,
  Tooltip,
  Spinner,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FiHome,
  FiUsers,
  FiDollarSign,
  FiHeart,
  FiUser,
  FiBarChart,
  FiTrendingUp,
  FiAward,
} from 'react-icons/fi';

interface ContributorSidebarProps {
  isCollapsed: boolean;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
  } | null;
}

const ContributorSidebar: React.FC<ContributorSidebarProps> = ({ isCollapsed, user }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab');
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('green.50', 'green.900');
  const activeColor = useColorModeValue('green.600', 'green.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const statsBg = useColorModeValue('gray.50', 'gray.900');
  const emptyStateBg = useColorModeValue('green.50', 'green.900');
  const emptyStateBorder = useColorModeValue('green.200', 'green.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const collapsedStatsBg = useColorModeValue('purple.50', 'purple.900');

  const [stats, setStats] = useState({
    totalContributions: 0,
    totalAmountMatic: 0,
    projectsSupported: 0,
    confirmedContributions: 0,
    pendingContributions: 0,
    averageContribution: 0,
    loading: true,
    error: false,
  });

  // Load stats using the new API client
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: false }));

        console.log('🔄 Loading sidebar stats...');
        
        // Use the new contribution API client
        const statsResult = await contributionApi.getMyStats();
        
        console.log('📊 Sidebar Stats API Response:', statsResult); // Debug log
        
        if (statsResult.success && statsResult.data) {
          const data = statsResult.data;
          console.log('✅ Stats Data Received:', data);
          
          setStats({
            totalContributions: data.totalContributions || 0,
            totalAmountMatic: data.totalAmountMatic || 0,
            projectsSupported: data.projectsSupported || 0,
            confirmedContributions: data.confirmedContributions || 0,
            pendingContributions: data.pendingContributions || 0,
            averageContribution: data.averageContribution || 0,
            loading: false,
            error: false,
          });
          
          console.log('✅ Final Stats State:', {
            totalContributions: data.totalContributions || 0,
            totalAmountMatic: data.totalAmountMatic || 0,
            projectsSupported: data.projectsSupported || 0,
          });
        } else {
          console.log('❌ No stats data in response:', statsResult);
          // No contributions yet or API returned error
          setStats({
            totalContributions: 0,
            totalAmountMatic: 0,
            projectsSupported: 0,
            confirmedContributions: 0,
            pendingContributions: 0,
            averageContribution: 0,
            loading: false,
            error: false,
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load sidebar stats';
        console.error('❌ Failed to load sidebar stats:', errorMessage);
        setStats({ 
          totalContributions: 0, 
          totalAmountMatic: 0,
          projectsSupported: 0,
          confirmedContributions: 0,
          pendingContributions: 0,
          averageContribution: 0,
          loading: false,
          error: true
        });
      
        // Only show error toast for actual errors, not for "no contributions" case
        if (errorMessage && !errorMessage.includes('No contributions')) {
          toast({
            title: 'Failed to load stats',
            description: 'Could not load your contribution statistics',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    loadStats();
  }, [toast]);

  // Let's also try an alternative approach - fetch contributions directly
  useEffect(() => {
    const loadContributionsDirectly = async () => {
      try {
        console.log('🔄 Trying alternative: Loading contributions directly...');
        const contributionsResult = await contributionApi.getMyContributions(1, 100);
        
        console.log('📊 Direct Contributions Response:', contributionsResult);
        
        if (contributionsResult.success && contributionsResult.data) {
          const contributions = contributionsResult.data.contributions || [];
          const totalMatic = contributions.reduce((sum: number, contribution: {
            amountMatic?: number;
            amount?: number;
            project?: { _id: string };
          }) => {
            return sum + (contribution.amountMatic || contribution.amount || 0);
          }, 0);          
          
          const uniqueProjects = new Set(contributions.map((c: {
            project?: { _id: string };
          }) => c.project?._id)).size;          
          
          console.log('💰 Calculated from contributions:', {
            totalContributions: contributions.length,
            totalAmountMatic: totalMatic,
            projectsSupported: uniqueProjects
          });
          
          // Update stats if we got better data
          if (totalMatic > 0) {
            setStats(prev => ({
              ...prev,
              totalContributions: contributions.length,
              totalAmountMatic: totalMatic,
              projectsSupported: uniqueProjects,
              loading: false
            }));
          }
        }
      } catch (error) {
        console.error('❌ Alternative approach failed:', error);
      }
    };

    // If stats are still 0 after loading, try alternative approach
    if (!stats.loading && stats.totalAmountMatic === 0) {
      loadContributionsDirectly();
    }
  }, [stats.loading, stats.totalAmountMatic]);

  const navItems = [
    {
      label: 'Dashboard',
      icon: FiHome,
      href: '/dashboard/investor',
      isActive: pathname === '/dashboard/investor' && !currentTab,
    },
    {
      label: 'Browse Projects',
      icon: FiUsers,
      href: '/projects/active',
      isActive: pathname === '/projects/active',
    },
    {
      label: 'My Contributions',
      icon: FiDollarSign,
      href: '/contributions/history',
      isActive: pathname === '/contributions/history',
      badge: stats.totalContributions > 0 ? stats.totalContributions : undefined,
    },
    {
      label: 'Favorites',
      icon: FiHeart,
      href: '/projects/favorites',
      isActive: pathname === '/projects/favorites',
    },
    {
      label: 'Analytics',
      icon: FiBarChart,
      href: '/dashboard/investor?tab=analytics',
      isActive: currentTab === 'analytics',
    },
    {
      label: 'Profile',
      icon: FiUser,
      href: '/dashboard/investor?tab=profile',
      isActive: currentTab === 'profile',
    },
  ];

  const NavItem = ({ item }: { 
    item: {
      label: string;
      icon: React.ElementType;
      href: string;
      isActive: boolean;
      badge?: number;
    } 
  }) => {  
    return (
      <Tooltip 
        label={isCollapsed ? item.label : ''} 
        placement="right" 
        isDisabled={!isCollapsed}
      >
        <Button
          as={NextLink}
          href={item.href}
          variant="ghost"
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          w="full"
          h="auto"
          py={3}
          px={isCollapsed ? 2 : 4}
          bg={item.isActive ? activeBg : 'transparent'}
          color={item.isActive ? activeColor : 'gray.600'}
          _hover={{
            bg: item.isActive ? activeBg : hoverBg,
            color: item.isActive ? activeColor : 'gray.800',
          }}
          borderRadius="lg"
          fontWeight={item.isActive ? 'semibold' : 'medium'}
          fontSize="md"
          transition="all 0.2s"
          position="relative"
        >
          <HStack spacing={3} w="full">
            <Icon 
              as={item.icon} 
              boxSize={5}
              color={item.isActive ? activeColor : 'gray.500'}
            />
            {!isCollapsed && (
              <>
                <Text flex="1" textAlign="left">
                  {item.label}
                </Text>
                {item.badge && (
                  <Badge 
                    colorScheme="green" 
                    borderRadius="full" 
                    fontSize="xs"
                    px={2}
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </HStack>
          {isCollapsed && item.badge && (
            <Box
              position="absolute"
              top={1}
              right={1}
              bg="green.500"
              color="white"
              borderRadius="full"
              fontSize="2xs"
              fontWeight="bold"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px={1}
            >
              {item.badge}
            </Box>
          )}
        </Button>
      </Tooltip>
    );
  };

  const formatMatic = (amount: number) => {
    console.log('💰 Formatting amount:', amount); // Debug log
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

  return (
    <Box
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      w={isCollapsed ? '70px' : '280px'}
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      zIndex={999}
      overflowY="auto"
      transition="width 0.3s ease"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#CBD5E0',
          borderRadius: '4px',
        },
      }}
    >
      <VStack spacing={0} align="stretch" h="full">
        {/* User Profile Section */}
        <Box p={isCollapsed ? 2 : 4} borderBottom="1px" borderColor={borderColor}>
          {isCollapsed ? (
            <Tooltip label={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'} placement="right">
              <Avatar
                size="sm"
                name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                bg="green.500"
                src={user?.profileImage}
                mx="auto"
              />
            </Tooltip>
          ) : (
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                bg="green.500"
                src={user?.profileImage}
              />
              <VStack spacing={0} align="start" flex={1}>
                <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {user?.email || 'No email'}
                </Text>
                <Badge colorScheme="blue" fontSize="xs" mt={1}>
                  Investor
                </Badge>
              </VStack>
            </HStack>
          )}
        </Box>

        {/* Navigation */}
        <VStack spacing={2} align="stretch" p={isCollapsed ? 2 : 4} flex="1">
          {navItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </VStack>

        {/* Bottom Stats (when not collapsed) */}
        {!isCollapsed && (
          <Box 
            p={4} 
            borderTop="1px" 
            borderColor={borderColor} 
            bg={statsBg}
          >
            <VStack spacing={3} align="stretch">
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                Investment Stats
              </Text>
              
              {stats.loading ? (
                <HStack justify="center" py={2}>
                  <Spinner size="sm" color="green.500" thickness="2px" />
                  <Text fontSize="xs" color="gray.500">Loading stats...</Text>
                </HStack>
              ) : stats.error ? (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Stats unavailable
                </Text>
              ) : stats.totalContributions === 0 ? (
                <Box 
                  bg={emptyStateBg}
                  p={3} 
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={emptyStateBorder}
                  textAlign="center"
                >
                  <Icon as={FiTrendingUp} color="green.500" boxSize={5} mb={2} mx="auto" />
                  <Text fontSize="xs" color="green.700" fontWeight="medium" mb={1}>
                    Ready to Invest?
                  </Text>
                  <Text fontSize="2xs" color="green.600">
                    Start contributing to see your stats here!
                  </Text>
                </Box>
              ) : (
                <>
                  {/* Total Invested Card */}
                  <Box 
                    bg={cardBg}
                    p={3} 
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      right={0}
                      w="60px"
                      h="60px"
                      bg="purple.100"
                      borderRadius="full"
                      transform="translate(20px, -20px)"
                      opacity="0.6"
                    />
                    <VStack spacing={1} align="center">
                      <Text fontSize="2xs" color="gray.500" fontWeight="medium">
                        TOTAL INVESTED
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="xl" fontWeight="bold" color="purple.600">
                          {formatMatic(stats.totalAmountMatic)}
                        </Text>
                        <Text fontSize="md" fontWeight="bold" color="purple.500">
                          ⬡
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color="gray.400">
                        MATIC on Polygon
                      </Text>
                    </VStack>
                  </Box>

                  {/* Quick Stats */}
                  <SimpleGrid columns={2} spacing={2}>
                    <Box 
                      bg={cardBg}
                      p={2}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                      textAlign="center"
                    >
                      <Icon as={FiDollarSign} color="green.500" boxSize={3} mb={1} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.700">
                        {formatCompactNumber(stats.totalContributions)}
                      </Text>
                      <Text fontSize="2xs" color="gray.500">Contributions</Text>
                    </Box>
                    
                    <Box 
                      bg={cardBg}
                      p={2}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                      textAlign="center"
                    >
                      <Icon as={FiAward} color="blue.500" boxSize={3} mb={1} />
                      <Text fontSize="xs" fontWeight="bold" color="gray.700">
                        {formatCompactNumber(stats.projectsSupported)}
                      </Text>
                      <Text fontSize="2xs" color="gray.500">Projects</Text>
                    </Box>
                  </SimpleGrid>
                </>
              )}
            </VStack>
          </Box>
        )}

        {/* Collapsed Stats Indicator */}
        {isCollapsed && !stats.loading && stats.totalContributions > 0 && (
          <Tooltip 
            label={
              <VStack spacing={1} align="start">
                <Text fontWeight="bold">Investment Summary</Text>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm">Total Invested:</Text>
                  <Text fontSize="sm" fontWeight="bold">{formatMatic(stats.totalAmountMatic)} MATIC</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm">Contributions:</Text>
                  <Text fontSize="sm" fontWeight="bold">{stats.totalContributions}</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm">Projects:</Text>
                  <Text fontSize="sm" fontWeight="bold">{stats.projectsSupported}</Text>
                </HStack>
              </VStack>
            } 
            placement="right"
          >
            <Box 
              p={2} 
              borderTop="1px" 
              borderColor={borderColor}
              bg={collapsedStatsBg}
              textAlign="center"
              cursor="pointer"
            >
              <VStack spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color="purple.600" lineHeight="1">
                  {formatCompactNumber(stats.totalContributions)}
                </Text>
                <Text fontSize="2xs" color="purple.500" mt={-1}>
                  ⬡
                </Text>
                <Text fontSize="2xs" color="purple.400" fontWeight="medium">
                  {stats.totalAmountMatic > 1 ? formatMatic(stats.totalAmountMatic).split('.')[0] : '0'}
                </Text>
              </VStack>
            </Box>
          </Tooltip>
        )}

        {/* Collapsed Loading State */}
        {isCollapsed && stats.loading && (
          <Box p={2} borderTop="1px" borderColor={borderColor} textAlign="center">
            <Spinner size="sm" color="green.500" thickness="2px" />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ContributorSidebar;