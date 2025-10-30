"use client";
import { FiDollarSign, FiRefreshCw } from "react-icons/fi";
import { useAccount, useBalance } from "wagmi";

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Divider,
  Badge,
  useToast,
  Spinner,
} from '@chakra-ui/react';

export default function WithdrawalCard() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  
  const { data: balance, isLoading, refetch } = useBalance({
    address: address,
    chainId: 137, // Polygon Mainnet
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Balance Updated',
      status: 'success',
      duration: 2000,
    });
  };

  if (!isConnected) {
    return (
      <Card>
        <CardBody>
          <Text color="gray.600">Connect wallet to view balance</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">Wallet Balance</Text>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </HStack>

          <Divider />

          {isLoading ? (
            <VStack py={4}>
              <Spinner color="purple.500" />
            </VStack>
          ) : (
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Available Balance:</Text>
                <VStack align="end" spacing={0}>
                  <HStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                      {balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0'}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="purple.500">
                      MATIC
                    </Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="xs">Polygon Mainnet</Badge>
                </VStack>
              </HStack>

              <Text fontSize="xs" color="gray.500" fontFamily="mono">
                Wallet: {address?.slice(0, 8)}...{address?.slice(-6)}
              </Text>

              <Divider />

              <Text fontSize="sm" color="gray.600">
                You can withdraw your MATIC directly from your MetaMask wallet at any time.
              </Text>

              <Button
                colorScheme="purple"
                leftIcon={<Icon as={FiDollarSign} />}
                onClick={() => {
                  const ethereum = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
                  if (typeof window !== 'undefined' && ethereum) {
                    ethereum.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: '0x89' }], // Polygon Mainnet (137 in hex)
                    }).catch((error) => {
                      console.error('Failed to switch network:', error);
                    });
                  }
                  toast({
                    title: 'Manage in MetaMask',
                    description: 'You can send MATIC directly from your MetaMask wallet',
                    status: 'info',
                    duration: 5000,
                  });
                }}
              >
                Open MetaMask
              </Button>
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}