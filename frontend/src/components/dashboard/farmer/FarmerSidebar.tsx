"use client";
import NextLink from "next/link";
import React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Collapse,
  Divider,
  Badge,
  Avatar,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiHome,
  FiBarChart,
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiTrendingUp,
  FiSend,
  FiPackage,
} from 'react-icons/fi';

interface SidebarProps {
  isCollapsed: boolean;
  user: any;
}

const FarmerSidebar: React.FC<SidebarProps> = ({ isCollapsed, user }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab');
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const mainNavItems = [
    {
      label: 'Dashboard',
      icon: FiHome,
      href: '/dashboard/farmer',
      isActive: pathname === '/dashboard/farmer' && !currentTab,
    },
    {
      label: 'Projects',
      icon: FiBarChart,
      href: '/dashboard/farmer?tab=projects',
      isActive: currentTab === 'projects',
      hasSubmenu: true,
      submenu: [
        { label: 'All Projects', href: '/dashboard/farmer?tab=projects', icon: FiBarChart },
        { label: 'Active Projects', href: '/dashboard/farmer?tab=projects&filter=active', icon: FiBarChart },
        { label: 'Completed Projects', href: '/dashboard/farmer?tab=projects&filter=completed', icon: FiBarChart },
        { label: 'Create New', href: '/dashboard/farmer?tab=projects&action=create', icon: FiBarChart },
      ]
    },
    {
      label: 'Investments',
      icon: FiDollarSign,
      href: '/dashboard/farmer?tab=investments',
      isActive: currentTab === 'investments',
    },
    {
      label: 'Investors',
      icon: FiUsers,
      href: '/dashboard/farmer?tab=investors',
      isActive: currentTab === 'investors',
    },
    {
      label: 'Analytics',
      icon: FiTrendingUp,
      href: '/dashboard/farmer?tab=analytics',
      isActive: currentTab === 'analytics',
      hasSubmenu: true,
      submenu: [
        { label: 'Performance', href: '/dashboard/farmer?tab=analytics&view=performance', icon: FiTrendingUp },
        { label: 'Revenue', href: '/dashboard/farmer?tab=analytics&view=revenue', icon: FiTrendingUp },
        { label: 'ROI Analysis', href: '/dashboard/farmer?tab=analytics&view=roi', icon: FiTrendingUp },
      ]
    },
  ];

  const farmingNavItems = [
    {
      label: 'Farm Schedule',
      icon: FiCalendar,
      href: '/dashboard/farmer?tab=schedule',
      isActive: currentTab === 'schedule',
    },
    {
      label: 'Farm Location',
      icon: FiMapPin,
      href: '/dashboard/farmer?tab=location',
      isActive: currentTab === 'location',
    },
    {
      label: 'Crops & Seeds',
      icon: FiSend,
      href: '/dashboard/farmer?tab=crops',
      isActive: currentTab === 'crops',
    },
    {
      label: 'Inventory',
      icon: FiPackage,
      href: '/dashboard/farmer?tab=inventory',
      isActive: currentTab === 'inventory',
    },
  ];

  const accountNavItems = [
    {
      label: 'Profile & Settings',
      icon: FiUser,
      href: '/dashboard/farmer?tab=profile',
      isActive: currentTab === 'profile',
    },
  ];

  const NavItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const isSubmenuItem = level > 0;
    
    return (
      <Box w="full">
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
            pl={isSubmenuItem && !isCollapsed ? 8 : isCollapsed ? 2 : 4}
            bg={item.isActive ? activeBg : 'transparent'}
            color={item.isActive ? activeColor : 'gray.600'}
            _hover={{
              bg: item.isActive ? activeBg : hoverBg,
              color: item.isActive ? activeColor : 'gray.800',
            }}
            borderRadius="lg"
            fontWeight={item.isActive ? 'semibold' : 'medium'}
            fontSize={isSubmenuItem ? 'sm' : 'md'}
          >
            <HStack spacing={3} w="full">
              <Icon 
                as={item.icon} 
                boxSize={isSubmenuItem ? 4 : 5}
                color={item.isActive ? activeColor : 'gray.500'}
              />
              {!isCollapsed && (
                <>
                  <Text flex="1" textAlign="left">
                    {item.label}
                  </Text>
                  {item.hasSubmenu && (
                    <Icon 
                      as={item.isActive ? FiChevronDown : FiChevronRight} 
                      boxSize={4}
                    />
                  )}
                </>
              )}
            </HStack>
          </Button>
        </Tooltip>
        
        {/* Submenu */}
        {item.hasSubmenu && !isCollapsed && (
          <Collapse in={item.isActive}>
            <VStack spacing={1} mt={2} align="stretch">
              {item.submenu?.map((subItem: any, index: number) => (
                <NavItem key={index} item={subItem} level={1} />
              ))}
            </VStack>
          </Collapse>
        )}
      </Box>
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
        <Box p={isCollapsed ? 2 : 6} borderBottom="1px" borderColor={borderColor}>
          {isCollapsed ? (
            <Avatar
              size="sm"
              name={`${user?.firstName} ${user?.lastName}`}
              bg="brand.500"
              mx="auto"
            />
          ) : (
            <VStack spacing={3}>
              <Avatar
                size="lg"
                name={`${user?.firstName} ${user?.lastName}`}
                bg="brand.500"
                src={user?.profileImage}
              />
              <VStack spacing={1}>
                <Text fontWeight="bold" color="gray.800">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Badge colorScheme="green" size="sm">
                  Verified Farmer
                </Badge>
              </VStack>
            </VStack>
          )}
        </Box>

        {/* Navigation Sections */}
        <VStack spacing={6} align="stretch" p={isCollapsed ? 2 : 4} flex="1">
          {/* Main Navigation */}
          <VStack spacing={1} align="stretch">
            {!isCollapsed && (
              <Text fontSize="xs" fontWeight="bold" color="gray.400" px={2} mb={2}>
                MAIN
              </Text>
            )}
            {mainNavItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </VStack>

          <Divider />

          {/* Farming Section */}
          <VStack spacing={1} align="stretch">
            {!isCollapsed && (
              <Text fontSize="xs" fontWeight="bold" color="gray.400" px={2} mb={2}>
                FARMING
              </Text>
            )}
            {farmingNavItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </VStack>

          <Divider />

          {/* Account Section */}
          <VStack spacing={1} align="stretch">
            {!isCollapsed && (
              <Text fontSize="xs" fontWeight="bold" color="gray.400" px={2} mb={2}>
                ACCOUNT
              </Text>
            )}
            {accountNavItems.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </VStack>
        </VStack>

        {/* Bottom Stats (when not collapsed) */}
        {!isCollapsed && (
          <Box p={4} borderTop="1px" borderColor={borderColor}>
            <VStack spacing={2}>
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" color="gray.500">Active Projects</Text>
                <Text fontSize="xs" fontWeight="bold">3</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" color="gray.500">Total Funding</Text>
                <Text fontSize="xs" fontWeight="bold" color="green.500">$45,250</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontSize="xs" color="gray.500">ROI</Text>
                <Text fontSize="xs" fontWeight="bold" color="purple.500">18.5%</Text>
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FarmerSidebar;