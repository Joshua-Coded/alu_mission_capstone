"use client";
import { useEffect, useState } from "react";
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
    chainId: 11155111, // Sepolia
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
              <Spinner color="blue.500" />
            </VStack>
          ) : (
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">Available Balance:</Text>
                <VStack align="end" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0'} ETH
                  </Text>
                  <Badge colorScheme="blue" fontSize="xs">Sepolia Testnet</Badge>
                </VStack>
              </HStack>

              <Text fontSize="xs" color="gray.500" fontFamily="mono">
                Wallet: {address?.slice(0, 8)}...{address?.slice(-6)}
              </Text>

              <Divider />

              <Text fontSize="sm" color="gray.600">
                You can withdraw your ETH directly from your MetaMask wallet at any time.
              </Text>

              <Button
                colorScheme="blue"
                leftIcon={<Icon as={FiDollarSign} />}
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).ethereum) {
                    (window as any).ethereum.request({
                      method: 'wallet_switchEthereumChain',
                      params: [{ chainId: '0xaa36a7' }], // Sepolia
                    });
                  }
                  toast({
                    title: 'Manage in MetaMask',
                    description: 'You can send ETH directly from your MetaMask wallet',
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