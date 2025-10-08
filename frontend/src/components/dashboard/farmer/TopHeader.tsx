"use client";
import NextLink from "next/link";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSearchParams } from "next/navigation";

import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  useColorMode,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiMenu,
  FiBell,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSearch,
  FiHelpCircle,
} from 'react-icons/fi';

interface TopHeaderProps {
  user: any;
  address: string | undefined;
  onLogout: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  address,
  onLogout,
  onToggleSidebar,
  sidebarCollapsed
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const notificationCount = 3;

  const getCurrentPageName = () => {
    if (currentTab) {
      return currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
    }
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const descriptions = {
      projects: 'Manage your agricultural projects and track funding progress',
      investments: 'View your investment history and returns',
      investors: 'Connect with and manage your investor relationships',
      analytics: 'Analyze your farm performance and financial metrics',
      schedule: 'Plan and track your farming activities',
      location: 'Manage your farm locations and geographic data',
      crops: 'Track your crops, seeds, and planting schedules',
      inventory: 'Manage your farm equipment and inventory',
      profile: 'Update your farmer profile and verification status',
      settings: 'Configure your account and notification preferences',
    };
    
    return descriptions[currentTab as keyof typeof descriptions] || 
           'Overview of your farming operations and recent activity';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={998}
      ml={sidebarCollapsed ? '70px' : '280px'}
      transition="all 0.3s ease"
      shadow="sm"
      backdropFilter="blur(10px)"
    >
      <Container maxW="full" py={4}>
        <Flex justify="space-between" align="center">
          
          {/* Left Section - Page Info */}
          <HStack spacing={4} flex="1" minW="0">
            <Tooltip label="Toggle Sidebar" fontSize="xs">
              <IconButton
                aria-label="Toggle Sidebar"
                icon={<FiMenu />}
                variant="ghost"
                onClick={onToggleSidebar}
                size="md"
                bg={useColorModeValue('gray.50', 'gray.700')}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.600'),
                }}
                borderRadius="lg"
              />
            </Tooltip>
            
            <Box flex="1" maxW="500px" minW="0">
              {/* Page Title */}
              <HStack spacing={3} mb={1} align="center">
                <Text 
                  fontSize={{ base: "lg", md: "xl" }} 
                  fontWeight="bold" 
                  color={textColor}
                  noOfLines={1}
                >
                  {getCurrentPageName()}
                </Text>
                {currentTab === 'profile' && (
                  <Badge 
                    colorScheme="green" 
                    size="sm" 
                    variant="subtle"
                    borderRadius="full"
                  >
                    Verified
                  </Badge>
                )}
              </HStack>
              
              {/* Breadcrumbs */}
              <Breadcrumb 
                fontSize="sm" 
                color={subtleTextColor} 
                mb={2}
                separator="/"
              >
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    as={NextLink} 
                    href="/dashboard"
                    _hover={{ color: 'brand.500' }}
                    transition="color 0.2s"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    as={NextLink} 
                    href="/dashboard/farmer"
                    _hover={{ color: 'brand.500' }}
                    transition="color 0.2s"
                  >
                    Farmer
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentTab && (
                  <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink color={textColor} fontWeight="medium">
                      {getCurrentPageName()}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </Breadcrumb>
              
              {/* Page Description */}
              <Text 
                fontSize="sm" 
                color={mutedTextColor} 
                display={{ base: 'none', lg: 'block' }}
                noOfLines={1}
              >
                {getPageDescription()}
              </Text>
            </Box>
          </HStack>

          {/* Center Section - Search */}
          <HStack 
            spacing={4} 
            flex="0.8" 
            justify="center" 
            display={{ base: 'none', xl: 'flex' }}
            maxW="400px"
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none" color={subtleTextColor}>
                <FiSearch size="16" />
              </InputLeftElement>
              <Input
                placeholder="Search projects, investors, crops..."
                size="md"
                borderRadius="lg"
                bg={useColorModeValue('gray.50', 'gray.700')}
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                _focus={{
                  bg: useColorModeValue('white', 'gray.600'),
                  shadow: 'sm',
                  borderColor: 'brand.500',
                  transform: 'scale(1.02)',
                }}
                _placeholder={{ color: subtleTextColor }}
                transition="all 0.2s"
              />
            </InputGroup>
          </HStack>

          {/* Right Section - Actions */}
          <HStack spacing={2} flex="1" justify="flex-end" minW="0">
            
            {/* Wallet Dropdown */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FiChevronDown />}
                variant="ghost"
                size="sm"
                bg={useColorModeValue('gray.50', 'gray.700')}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.600'),
                }}
                _active={{
                  bg: useColorModeValue('gray.100', 'gray.600'),
                }}
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                transition="all 0.2s"
                fontWeight="medium"
                px={3}
              >
                <HStack spacing={2}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={address ? 'green.500' : 'gray.400'}
                    transition="all 0.2s"
                  />
                  <Text fontSize="sm" color={textColor}>
                    {address ? formatAddress(address) : 'Connect Wallet'}
                  </Text>
                </HStack>
              </MenuButton>
              
              <MenuList 
                shadow="xl" 
                border="1px" 
                borderColor={borderColor}
                bg={bg}
                borderRadius="xl"
                overflow="hidden"
                minW="280px"
              >
                {address ? (
                  // Connected Wallet Menu
                  <>
                    <Box px={4} py={4} borderBottom="1px" borderColor={borderColor}>
                      <HStack spacing={3} mb={3}>
                        <Box
                          w="32px"
                          h="32px"
                          borderRadius="full"
                          bg="green.500"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                        >
                          <Text fontSize="xs">🔗</Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            Wallet Connected
                          </Text>
                          <Text fontSize="xs" color={subtleTextColor}>
                            MetaMask
                          </Text>
                        </Box>
                      </HStack>
                      
                      <Box mb={3}>
                        <Text fontSize="xs" color={subtleTextColor} mb={1}>
                          Address
                        </Text>
                        <Text 
                          fontSize="sm" 
                          fontFamily="mono" 
                          fontWeight="medium" 
                          color={textColor}
                          bg={useColorModeValue('gray.50', 'gray.800')}
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {address}
                        </Text>
                      </Box>
                      
                      <Box>
                        <Text fontSize="xs" color={subtleTextColor} mb={1}>
                          Balance
                        </Text>
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="medium" color={textColor}>
                            0.040 ETH
                          </Text>
                          <Text fontSize="xs" color={subtleTextColor}>
                            ~$95.20
                          </Text>
                        </HStack>
                      </Box>
                    </Box>
                    
                    <MenuItem 
                      onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      py={3}
                    >
                      <Text fontSize="sm">View on Etherscan</Text>
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                        // Add toast notification here if needed
                      }}
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      py={3}
                    >
                      <Text fontSize="sm">Copy Address</Text>
                    </MenuItem>
                    
                    <MenuDivider />
                    
                    <MenuItem 
                      onClick={() => {
                        // Add your wallet disconnect logic here
                        console.log('Disconnecting wallet...');
                      }}
                      color="red.500"
                      _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                      py={3}
                    >
                      <Text fontSize="sm">Disconnect Wallet</Text>
                    </MenuItem>
                  </>
                ) : (
                  // Not Connected Menu
                  <>
                    <Box px={4} py={4} borderBottom="1px" borderColor={borderColor}>
                      <HStack spacing={3} mb={3}>
                        <Box
                          w="32px"
                          h="32px"
                          borderRadius="full"
                          bg="gray.400"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                        >
                          <Text fontSize="xs">🔗</Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            No Wallet Connected
                          </Text>
                          <Text fontSize="xs" color={subtleTextColor}>
                            Connect to get started
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                    
                    <Box px={4} py={3}>
                      <ConnectButton />
                    </Box>
                    
                    <Box px={4} py={3}>
                      <Text fontSize="xs" color={subtleTextColor} textAlign="center">
                        Connect your wallet to access farming features
                      </Text>
                    </Box>
                  </>
                )}
              </MenuList>
            </Menu>

            {/* Action Buttons */}
            <HStack spacing={1}>
              {/* Color Mode Toggle */}
              <Tooltip 
                label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                fontSize="xs"
              >
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                  variant="ghost"
                  onClick={toggleColorMode}
                  size="sm"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.600'),
                    transform: 'scale(1.05)',
                  }}
                  borderRadius="lg"
                  border="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  transition="all 0.2s"
                />
              </Tooltip>

              {/* Help Button */}
              <Tooltip label="Help & Support" fontSize="xs">
                <IconButton
                  aria-label="Help"
                  icon={<FiHelpCircle />}
                  variant="ghost"
                  size="sm"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.600'),
                    transform: 'scale(1.05)',
                  }}
                  borderRadius="lg"
                  border="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  transition="all 0.2s"
                />
              </Tooltip>

              {/* Notifications */}
              <Tooltip label="Notifications" fontSize="xs">
                <Box position="relative">
                  <IconButton
                    aria-label="Notifications"
                    icon={<FiBell />}
                    variant="ghost"
                    size="sm"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.600'),
                      transform: 'scale(1.05)',
                    }}
                    borderRadius="lg"
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    transition="all 0.2s"
                  />
                  {notificationCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="2xs"
                      minW="18px"
                      h="18px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px"
                      borderColor={bg}
                      fontWeight="bold"
                      animation="pulse 2s infinite"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Box>
              </Tooltip>
            </HStack>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FiChevronDown />}
                variant="ghost"
                size="sm"
                leftIcon={<FiUser />}
                bg={useColorModeValue('gray.50', 'gray.700')}
                _hover={{
                  bg: useColorModeValue('gray.100', 'gray.600'),
                }}
                _active={{
                  bg: useColorModeValue('gray.100', 'gray.600'),
                }}
                borderRadius="lg"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                transition="all 0.2s"
                fontWeight="medium"
              >
                <Text 
                  display={{ base: 'none', md: 'block' }}
                  color={textColor}
                  fontSize="sm"
                >
                  {user?.firstName || 'User'}
                </Text>
              </MenuButton>
              
              <MenuList 
                shadow="xl" 
                border="1px" 
                borderColor={borderColor}
                bg={bg}
                borderRadius="xl"
                overflow="hidden"
                minW="240px"
              >
                {/* User Info Section */}
                <Box px={4} py={4} borderBottom="1px" borderColor={borderColor}>
                  <HStack spacing={3}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg="brand.500"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0] || 'U'}
                    </Box>
                    <Box flex="1" minW="0">
                      <Text fontWeight="semibold" fontSize="sm" color={textColor} noOfLines={1}>
                        {user?.firstName} {user?.lastName}
                      </Text>
                      <Text fontSize="xs" color={subtleTextColor} noOfLines={1}>
                        {user?.email}
                      </Text>
                      <Badge 
                        colorScheme="green" 
                        size="sm" 
                        mt={1}
                        variant="subtle"
                        borderRadius="full"
                      >
                        Verified Farmer
                      </Badge>
                    </Box>
                  </HStack>
                </Box>
                
                {/* Menu Items */}
                <MenuItem 
                  icon={<FiUser />}
                  onClick={() => window.location.href = '/dashboard/farmer?tab=profile'}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  py={3}
                >
                  <Text fontSize="sm">Profile Settings</Text>
                </MenuItem>
                <MenuItem 
                  icon={<FiSettings />}
                  onClick={() => window.location.href = '/dashboard/farmer?tab=settings'}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  py={3}
                >
                  <Text fontSize="sm">Account Settings</Text>
                </MenuItem>
                
                <MenuDivider />
                
                <MenuItem 
                  icon={<FiLogOut />} 
                  onClick={onLogout} 
                  color="red.500"
                  _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                  py={3}
                >
                  <Text fontSize="sm">Logout</Text>
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default TopHeader;