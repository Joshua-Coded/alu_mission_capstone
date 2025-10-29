"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAccount } from "wagmi";
import { api } from "@/lib/api";

import {
  Box,
  Button,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  HStack,
  Icon,
  Spinner,
  Badge,
} from '@chakra-ui/react';

export default function FarmerWalletConnect() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const toast = useToast();

  const handleSyncWallet = async () => {
    if (!address) {
      toast({
        title: 'No Wallet Connected',
        description: 'Please connect your wallet first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const result = await api.updateWalletAddress(address);

      if (result.success) {
        setSynced(true);
        toast({
          title: 'Wallet Connected! 🎉',
          description: 'Your wallet is now synced. You can receive investments!',
          status: 'success',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Wallet sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.response?.data?.message || 'Failed to sync wallet',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <Heading size="md">Connect Your Wallet</Heading>
          <Badge colorScheme="purple" fontSize="sm">
            Polygon Network
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Step 1: Connect MetaMask */}
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Step 1: Connect MetaMask
            </Text>
            {!isConnected ? (
              <ConnectButton />
            ) : (
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                <Text fontSize="sm" color="green.600">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </Text>
              </HStack>
            )}
          </Box>

          {/* Step 2: Sync with Platform */}
          {isConnected && (
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Step 2: Sync with RootRise
              </Text>
              <Button
                onClick={handleSyncWallet}
                colorScheme="green"
                isLoading={loading}
                loadingText="Syncing..."
                isDisabled={synced}
                leftIcon={synced ? <Icon as={FiCheckCircle} /> : undefined}
              >
                {synced ? 'Wallet Synced!' : 'Sync Wallet'}
              </Button>
            </Box>
          )}

          {/* Success Message */}
          {synced && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>All Set! 🎉</AlertTitle>
                <AlertDescription fontSize="sm">
                  Your wallet is now connected. Investors can send funds directly to your wallet address on the Polygon network.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Information */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Why connect your wallet?</AlertTitle>
              <AlertDescription fontSize="xs">
                When investors fund your project, the MATIC tokens go directly to your wallet on the Polygon blockchain. You have full control of your funds with low transaction fees.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Network Information */}
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">🌐 Network Information</AlertTitle>
              <AlertDescription fontSize="xs">
                <VStack align="start" spacing={1}>
                  <Text><strong>Main Network:</strong> Polygon Mainnet</Text>
                  <Text><strong>Currency:</strong> MATIC</Text>
                  <Text><strong>Benefits:</strong> Low fees, fast transactions</Text>
                  <Text><strong>Chain ID:</strong> 137</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>

          {/* Polygon Benefits */}
          <Alert status="success" borderRadius="md" variant="subtle">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">🚀 Why Polygon?</AlertTitle>
              <AlertDescription fontSize="xs">
                <VStack align="start" spacing={1}>
                  <Text>• Ultra-low transaction fees (less than $0.01)</Text>
                  <Text>• Fast 2-second block times</Text>
                  <Text>• Eco-friendly proof-of-stake consensus</Text>
                  <Text>• Full Ethereum compatibility</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </CardBody>
    </Card>
  );
}