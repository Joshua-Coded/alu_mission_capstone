"use client";
import NextLink from "next/link";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { User } from '@/types';

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
  useToast,
  Tooltip,
  VStack,
  Stack,
  Show,
  Hide,
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
  FiHelpCircle,
  FiCopy,
  FiExternalLink,
} from 'react-icons/fi';

interface TopHeaderProps {
  user: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onLogout,
  onToggleSidebar,
  sidebarCollapsed
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const toast = useToast();
  
  // Move all useColorModeValue hooks to the top-level (before any returns or conditionals)
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const addressBg = useColorModeValue('gray.50', 'gray.700');
  
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const notificationCount = 0; // TODO: Get from API

  const getCurrentPageName = () => {
    if (!currentTab) return 'Dashboard';
    return currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace(/-/g, ' ');
  };

  const getPageDescription = () => {
    const descriptions: Record<string, string> = {
      projects: 'Manage your agricultural projects and track funding',
      inventory: 'Track equipment, supplies, and resources',
      profile: 'Update your farmer profile and settings',
    };
    
    return descriptions[currentTab || ''] || 
           'Overview of your farming operations';
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully',
      status: 'info',
      duration: 2000,
    });
  };

  const handleViewOnPolygonscan = () => {
    if (address) {
      window.open(`https://polygonscan.com/address/${address}`, '_blank');
    }
  };

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="fixed"
      top={0}
      left={{ base: 0, md: sidebarCollapsed ? '70px' : '280px' }}
      right={0}
      zIndex={998}
      transition="left 0.3s ease"
      shadow="sm"
    >
      <Container maxW="full" py={{ base: 2, md: 3 }} px={{ base: 3, md: 6 }}>
        <Flex justify="space-between" align="center" gap={2}>
          
          {/* Left Section - Page Info */}
          <HStack spacing={{ base: 2, md: 4 }} flex="1" minW="0">
            <Tooltip label="Toggle Sidebar" fontSize="xs">
              <IconButton
                aria-label="Toggle Sidebar"
                icon={<FiMenu />}
                variant="ghost"
                onClick={onToggleSidebar}
                size={{ base: "sm", md: "md" }}
                borderRadius="lg"
              />
            </Tooltip>
            
            <Box flex="1" minW="0">
              <HStack spacing={2} mb={1} align="center">
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
                    fontSize="xs"
                    px={2}
                    py={1}
                  >
                    ✓ Verified
                  </Badge>
                )}
              </HStack>
              
              <Hide below="sm">
                <Breadcrumb 
                  fontSize="xs" 
                  color={subtleTextColor}
                  separator="/"
                >
                  <BreadcrumbItem>
                    <BreadcrumbLink as={NextLink} href="/dashboard/farmer">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentTab && (
                    <BreadcrumbItem isCurrentPage>
                      <BreadcrumbLink fontWeight="medium">
                        {getCurrentPageName()}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                </Breadcrumb>
                
                <Text 
                  fontSize="xs" 
                  color={mutedTextColor} 
                  display={{ base: 'none', lg: 'block' }}
                  noOfLines={1}
                  mt={1}
                >
                  {getPageDescription()}
                </Text>
              </Hide>
            </Box>
          </HStack>

          {/* Right Section - Actions */}
          <Stack 
            direction={{ base: "row", md: "row" }} 
            spacing={{ base: 1, md: 2 }}
            align="center"
          >
            
            {/* Wallet Menu */}
            {isConnected && address ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<Hide below="sm"><FiChevronDown /></Hide>}
                  variant="outline"
                  size={{ base: "sm", md: "sm" }}
                  borderRadius="lg"
                  fontWeight="medium"
                  px={{ base: 2, md: 3 }}
                >
                  <HStack spacing={2}>
                    <Box w="6px" h="6px" borderRadius="full" bg="green.500" />
                    <Show above="sm">
                      <Text fontSize="sm">{formatAddress(address)}</Text>
                    </Show>
                    <Hide above="sm">
                      <Text fontSize="xs">Wallet</Text>
                    </Hide>
                  </HStack>
                </MenuButton>
                
                <MenuList shadow="xl" minW="280px">
                  <Box px={4} py={3} borderBottom="1px" borderColor={borderColor}>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        <Box
                          w="24px"
                          h="24px"
                          borderRadius="full"
                          bg="green.500"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontSize="xs"
                        >
                          ✓
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="semibold">
                            Wallet Connected
                          </Text>
                          <Text fontSize="xs" color={subtleTextColor}>
                            MetaMask
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <Box w="full">
                        <Text fontSize="xs" color={subtleTextColor} mb={1}>
                          Address
                        </Text>
                        <Text 
                          fontSize="xs" 
                          fontFamily="mono" 
                          bg={addressBg}
                          px={2}
                          py={1}
                          borderRadius="md"
                          noOfLines={1}
                        >
                          {address}
                        </Text>
                      </Box>
                      
                      {balance && (
                        <Box w="full">
                          <Text fontSize="xs" color={subtleTextColor} mb={1}>
                            Balance
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                  
                  <MenuItem icon={<FiCopy />} onClick={handleCopyAddress}>
                    Copy Address
                  </MenuItem>
                  
                  <MenuItem icon={<FiExternalLink />} onClick={handleViewOnPolygonscan}>
                    View on Polygonscan
                  </MenuItem>
                  
                  <MenuDivider />
                  
                  <MenuItem 
                    icon={<FiLogOut />}
                    onClick={handleDisconnect}
                    color="red.500"
                  >
                    Disconnect Wallet
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                size={{ base: "sm", md: "sm" }}
                colorScheme="green"
                borderRadius="lg"
                onClick={() => toast({
                  title: 'Connect Wallet',
                  description: 'Please connect your wallet from the sidebar',
                  status: 'info',
                  duration: 3000,
                })}
              >
                <Show above="sm">Connect Wallet</Show>
                <Hide above="sm">Connect</Hide>
              </Button>
            )}

            {/* Action Buttons */}
            <HStack spacing={{ base: 0, md: 1 }}>
              <Tooltip label={`${colorMode === 'light' ? 'Dark' : 'Light'} mode`} fontSize="xs">
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                  variant="ghost"
                  onClick={toggleColorMode}
                  size={{ base: "sm", md: "sm" }}
                  borderRadius="lg"
                />
              </Tooltip>

              <Tooltip label="Help & Support" fontSize="xs">
                <IconButton
                  aria-label="Help"
                  icon={<FiHelpCircle />}
                  variant="ghost"
                  size={{ base: "sm", md: "sm" }}
                  borderRadius="lg"
                />
              </Tooltip>

              <Tooltip label="Notifications" fontSize="xs">
                <Box position="relative">
                  <IconButton
                    aria-label="Notifications"
                    icon={<FiBell />}
                    variant="ghost"
                    size={{ base: "sm", md: "sm" }}
                    borderRadius="lg"
                  />
                  {notificationCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-1px"
                      right="-1px"
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="2xs"
                      minW="16px"
                      h="16px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Box>
              </Tooltip>
            </HStack>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<Hide below="md"><FiChevronDown /></Hide>}
                variant="ghost"
                size={{ base: "sm", md: "sm" }}
                leftIcon={<Hide below="md"><FiUser /></Hide>}
                borderRadius="lg"
                fontWeight="medium"
                px={{ base: 2, md: 3 }}
              >
                <Show above="md">
                  <Text fontSize="sm">
                    {user?.firstName || 'User'}
                  </Text>
                </Show>
                <Hide above="md">
                  <FiUser />
                </Hide>
              </MenuButton>
              
              <MenuList shadow="xl" minW="240px">
                <Box px={4} py={3} borderBottom="1px" borderColor={borderColor}>
                  <HStack spacing={3}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      bg="green.500"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Box>
                    <VStack align="start" spacing={0} flex={1} minW="0">
                      <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                        {user?.firstName} {user?.lastName}
                      </Text>
                      <Text fontSize="xs" color={subtleTextColor} noOfLines={1}>
                        {user?.email}
                      </Text>
                      <Badge colorScheme="green" fontSize="xs" mt={1}>
                        Farmer
                      </Badge>
                    </VStack>
                  </HStack>
                </Box>
                
                <MenuItem 
                  icon={<FiUser />}
                  onClick={() => window.location.href = '/dashboard/farmer?tab=profile'}
                >
                  Profile Settings
                </MenuItem>
                <MenuItem 
                  icon={<FiSettings />}
                  onClick={() => window.location.href = '/dashboard/farmer?tab=settings'}
                >
                  Account Settings
                </MenuItem>
                
                <MenuDivider />
                
                <MenuItem 
                  icon={<FiLogOut />} 
                  onClick={onLogout} 
                  color="red.500"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default TopHeader;