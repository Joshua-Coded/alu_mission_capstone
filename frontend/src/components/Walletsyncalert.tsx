"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  HStack,
  Box,
  useToast,
  Spinner,
} from '@chakra-ui/react';

export default function WalletSyncAlert() {
  const { address,  } = useAccount();
  useAuth();
  const [loading, setLoading] = useState(false);
  const [, setSynced] = useState(false);
  const [, setDismissed] = useState(false);
  const toast = useToast();

  
  const handleSync = async () => {
    if (!address) return;

    try {
      setLoading(true);

      const result = await api.updateWalletAddress(address);

      if (result.success) {
        setSynced(true);
        toast({
          title: 'Wallet Synced! 🎉',
          description: 'Your wallet is now connected. You can receive investments!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reload user data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: unknown) {
      console.error('Wallet sync error:', error);
      const errorMessage = (() => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const resp = (error as { response?: { data?: { message?: string } } }).response;
          return resp?.data?.message || 'Failed to sync wallet. Please try again.';
        }
        return 'Failed to sync wallet. Please try again.';
      })();
        
      toast({
        title: 'Sync Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Alert
      status="warning"
      variant="left-accent"
      borderRadius="md"
      mb={6}
      bg="orange.50"
      borderColor="orange.400"
    >
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="md" mb={1}>
          🔗 Sync Your Wallet to Receive Investments
        </AlertTitle>
        <AlertDescription display="block" fontSize="sm" mb={3}>
          Your MetaMask wallet is connected ({address?.slice(0, 6)}...{address?.slice(-4)}), 
          but you need to sync it with RootRise so investors can send funds directly to you.
        </AlertDescription>
        <HStack spacing={3}>
          <Button
            size="sm"
            colorScheme="orange"
            onClick={handleSync}
            isLoading={loading}
            loadingText="Syncing..."
          >
            {loading ? <Spinner size="sm" mr={2} /> : null}
            Sync Wallet Now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </HStack>
      </Box>
    </Alert>
  );
}