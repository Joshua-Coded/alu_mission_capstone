"use client";
import { useEffect, useState } from "react";
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
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';

export default function WalletSyncAlert() {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const toast = useToast();

  // Check if wallet is already synced
  const hasWalletSynced = user?.walletAddress && user.walletAddress.length > 0;
  
  // Check if current wallet matches synced wallet
//   const isCurrentWalletSynced = hasWalletSynced && 
//     user.walletAddress.toLowerCase() === address?.toLowerCase();

//   useEffect(() => {
//     if (isCurrentWalletSynced) {
//       setSynced(true);
//     }
//   }, [isCurrentWalletSynced]);

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
    } catch (error: any) {
      console.error('Wallet sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.response?.data?.message || 'Failed to sync wallet. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show if: not connected, already synced, or dismissed
//   if (!isConnected || synced || dismissed || isCurrentWalletSynced) {
//     return null;
//   }

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