"use client";
import NextLink from "next/link";
import React, { useEffect, useState } from "react";
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
} from '@chakra-ui/react';
import { 
  FiHome,
  FiFolder,
  FiUser,
  FiPackage,
} from 'react-icons/fi';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  user: User | null;
}

interface Stats {
  activeProjects: number;
  totalFunding: number;
  loading: boolean;
}

const FarmerSidebar: React.FC<SidebarProps> = ({ isCollapsed, user }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab');
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('green.50', 'green.900');
  const activeColor = useColorModeValue('green.600', 'green.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const bottomBg = useColorModeValue('gray.50', 'gray.900');

  const [stats, setStats] = useState<Stats>({
    activeProjects: 0,
    totalFunding: 0,
    loading: true,
  });

  // Load real stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/my-projects`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        
        if (response.ok) {
          const projects: Array<{ status?: string; currentFunding?: number }> = await response.json();
          const activeCount = projects.filter((p) => p.status === 'active').length;
          const totalFunding = projects.reduce((sum, p) => sum + (p.currentFunding || 0), 0);
          
          setStats({
            activeProjects: activeCount,
            totalFunding,
            loading: false,
          });
        } else {
          setStats({ activeProjects: 0, totalFunding: 0, loading: false });
        }
      } catch {
        console.error('Failed to load sidebar stats');
        setStats({ activeProjects: 0, totalFunding: 0, loading: false });
      }
    };

    loadStats();
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      icon: FiHome,
      href: '/dashboard/farmer',
      isActive: pathname === '/dashboard/farmer' && !currentTab,
    },
    {
      label: 'My Projects',
      icon: FiFolder,
      href: '/dashboard/farmer?tab=projects',
      isActive: currentTab === 'projects',
    },
    {
      label: 'Inventory',
      icon: FiPackage,
      href: '/dashboard/farmer?tab=inventory',
      isActive: currentTab === 'inventory',
    },
    {
      label: 'Profile',
      icon: FiUser,
      href: '/dashboard/farmer?tab=profile',
      isActive: currentTab === 'profile',
    },
  ];

  const NavItem = ({ item }: { item: { label: string; icon: React.ElementType; href: string; isActive: boolean; } }) => {
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
        >
          <HStack spacing={3} w="full">
            <Icon 
              as={item.icon} 
              boxSize={5}
              color={item.isActive ? activeColor : 'gray.500'}
            />
            {!isCollapsed && (
              <Text flex="1" textAlign="left">
                {item.label}
              </Text>
            )}
          </HStack>
        </Button>
      </Tooltip>
    );
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
            <Tooltip label={`${user?.firstName} ${user?.lastName}`} placement="right">
              <Avatar
                size="sm"
                name={`${user?.firstName} ${user?.lastName}`}
                bg="green.500"
                src={user?.profileImage}
                mx="auto"
              />
            </Tooltip>
          ) : (
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={`${user?.firstName} ${user?.lastName}`}
                bg="green.500"
                src={user?.profileImage}
              />
              <VStack spacing={0} align="start" flex={1}>
                <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {user?.email}
                </Text>
                <Badge colorScheme="green" fontSize="xs" mt={1}>
                  Farmer
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
          <Box p={4} borderTop="1px" borderColor={borderColor} bg={bottomBg}>
            <VStack spacing={3}>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" w="full" textAlign="left">
                QUICK STATS
              </Text>
              
              {stats.loading ? (
                <Spinner size="sm" color="green.500" />
              ) : (
                <>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600">Active Projects</Text>
                    <Badge colorScheme="green" fontSize="xs">
                      {stats.activeProjects}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600">Total Funding</Text>
                    <Text fontSize="xs" fontWeight="bold" color="green.600">
                      {stats.totalFunding.toLocaleString()} MATIC {/* ✅ CHANGED: USD to MATIC */}
                    </Text>
                  </HStack>
                </>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FarmerSidebar;