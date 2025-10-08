"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiLock, FiShield, FiWifi } from "react-icons/fi";
import { useAccount } from "wagmi";

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
} from '@chakra-ui/react';

interface WalletConnectionGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function WalletConnectionGuard({ 
  children, 
  title = "Connect Your Wallet",
  description = "Please connect your wallet to access this dashboard and all features."
}: WalletConnectionGuardProps) {
  const { isConnected, address } = useAccount();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
                      <Text>Decentralized platform access</Text>
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

  // Show children if wallet is connected
  return <>{children}</>;
}