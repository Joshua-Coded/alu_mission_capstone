"use client";
import NetworkStatus from "@/components/NetworkStatus";
import WithdrawalGuide from "@/components/WithdrawalGuide";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiAlertTriangle, FiLock, FiShield, FiWifi } from "react-icons/fi";
import { useAccount, useChainId } from "wagmi";

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Badge,
} from '@chakra-ui/react';

interface WalletConnectionGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showNetworkStatus?: boolean;
  showWithdrawalButton?: boolean;
}

export default function WalletConnectionGuard({ 
  children, 
  title = "Connect Your Wallet",
  description = "Please connect your wallet to access this dashboard and all features.",
  showNetworkStatus = true,
  showWithdrawalButton = true
}: WalletConnectionGuardProps) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Modals
  const { isOpen: isNetworkOpen, onOpen: onNetworkOpen, onClose: onNetworkClose } = useDisclosure();
  const { isOpen: isWithdrawalOpen, onOpen: onWithdrawalOpen, onClose: onWithdrawalClose } = useDisclosure();

  // ✅ UPDATED: Check for Polygon Mainnet
  const isPolygon = isConnected && chainId === 137; // Polygon Mainnet
  const isTestnet = isConnected && (chainId === 11155111 || chainId === 80001); // Sepolia or Mumbai
  const isWrongNetwork = isConnected && !isPolygon && !isTestnet;

  const getChainName = () => {
    if (!isConnected) return 'Not connected';
    switch(chainId) {
      case 137: return 'Polygon Mainnet'; // ✅ Main network
      case 80001: return 'Mumbai Testnet'; // Polygon testnet
      case 11155111: return 'Sepolia Testnet'; // Old testnet
      case 56: return 'BSC';
      case 42161: return 'Arbitrum';
      case 1: return 'Ethereum Mainnet';
      default: return `Unknown (${chainId})`;
    }
  };

  const getChainColor = () => {
    if (!isConnected) return 'gray';
    if (isPolygon) return 'green'; // ✅ Correct network
    if (isTestnet) return 'orange'; // ⚠️ Testnet
    return 'red'; // ❌ Wrong network
  };

  if (!isConnected) {
    return (
      <Box
        minH="100vh"
        bgGradient="linear(to-br, brand.50, green.50, blue.50)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Container maxW="md" centerContent>
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            border="1px"
            borderColor={borderColor}
            textAlign="center"
            w="full"
          >
            <VStack spacing={6}>
              {/* Icon */}
              <Icon as={FiWifi} boxSize={16} color="brand.500" />
              
              {/* Title */}
              <Heading size="lg" color="brand.600">
                {title}
              </Heading>
              
              {/* Description */}
              <Text color="gray.600" fontSize="md" lineHeight="tall">
                {description}
              </Text>
              
              {/* Security Info */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Your wallet connection is secure and encrypted. We never store your private keys.
                </AlertDescription>
              </Alert>
              
              {/* Connect Button */}
              <Box>
                <ConnectButton />
              </Box>
              
              {/* Features List */}
              <Box bg="gray.50" p={4} borderRadius="lg" w="full">
                <VStack spacing={3} align="start">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Why connect your wallet?
                  </Text>
                  <VStack spacing={2} align="start" fontSize="sm" color="gray.600">
                    <Box display="flex" alignItems="center">
                      <Icon as={FiShield} mr={2} color="green.500" />
                      <Text>Secure blockchain transactions</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Icon as={FiLock} mr={2} color="blue.500" />
                      <Text>Transparent investment tracking</Text>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Icon as={FiWifi} mr={2} color="purple.500" />
                      <Text>Low fees with Polygon (~$0.01)</Text>
                    </Box>
                  </VStack>
                </VStack>
              </Box>
              
              {/* Help Text */}
              <Box pt={4} borderTop="1px" borderColor={borderColor} w="full">
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  New to crypto wallets?{' '}
                  <Button variant="link" size="sm" colorScheme="brand">
                    Learn how to get started
                  </Button>
                </Text>
              </Box>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  // Connected - Show children with network status bar
  return (
    <>
      {/* Network Status Bar */}
      {showNetworkStatus && (
        <Box
          bg={isPolygon ? "green.50" : isTestnet ? "orange.50" : "red.50"}
          borderBottom="1px"
          borderColor={isPolygon ? "green.200" : isTestnet ? "orange.200" : "red.200"}
          py={2}
          px={4}
        >
          <Container maxW="container.xl">
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
              {/* Network Info */}
              <Flex align="center" gap={3}>
                <Badge 
                  colorScheme={getChainColor()}
                  fontSize="sm"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {getChainName()}
                </Badge>
                
                {isPolygon && (
                  <Flex align="center" gap={2}>
                    <Text fontSize="sm" color="green.700" fontWeight="medium">
                      ✅ Optimal Network - Low Fees
                    </Text>
                  </Flex>
                )}

                {isTestnet && (
                  <Flex align="center" gap={2}>
                    <Icon as={FiAlertTriangle} color="orange.500" />
                    <Text fontSize="sm" color="orange.700">
                      Testnet - No real value
                    </Text>
                  </Flex>
                )}

                {isWrongNetwork && (
                  <Flex align="center" gap={2}>
                    <Icon as={FiAlertTriangle} color="red.500" />
                    <Text fontSize="sm" color="red.700" fontWeight="medium">
                      Wrong Network - Switch to Polygon
                    </Text>
                  </Flex>
                )}
              </Flex>

              {/* Action Buttons */}
              <Flex gap={2}>
                {!isPolygon && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={onNetworkOpen}
                  >
                    Switch to Polygon
                  </Button>
                )}
                
                {showWithdrawalButton && isPolygon && (
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={onWithdrawalOpen}
                  >
                    💰 Withdraw MATIC
                  </Button>
                )}
              </Flex>
            </Flex>
          </Container>
        </Box>
      )}

      {/* Testnet Warning */}
      {isTestnet && (
        <Box bg="orange.100" py={3} px={4}>
          <Container maxW="container.xl">
            <Alert status="warning" variant="left-accent">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                You&apos;re on a testnet. Switch to <strong>Polygon Mainnet</strong> for real transactions with super low fees (~$0.01).
              </AlertDescription>
            </Alert>
          </Container>
        </Box>
      )}

      {/* Wrong Network Warning */}
      {isWrongNetwork && (
        <Box bg="red.100" py={3} px={4}>
          <Container maxW="container.xl">
            <Alert status="error" variant="left-accent">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Please switch to <strong>Polygon Mainnet</strong> (Chain ID: 137) to use this platform.
              </AlertDescription>
            </Alert>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      {children}

      {/* Network Status Modal */}
      <Modal isOpen={isNetworkOpen} onClose={onNetworkClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Network Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <NetworkStatus />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Withdrawal Guide Modal */}
      <Modal isOpen={isWithdrawalOpen} onClose={onWithdrawalClose} size="4xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Withdraw Your Funds</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <WithdrawalGuide />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}