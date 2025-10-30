"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function WalletSync() {
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  const [, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const syncWallet = async () => {
      if (isConnected && address && isAuthenticated && user && !syncing) {
        // Skip if wallet already matches (check for undefined first)
        const userWallet = user.walletAddress?.toLowerCase();
        const connectedWallet = address.toLowerCase();
        
        if (userWallet && userWallet === connectedWallet) {
          console.log('✅ Wallet already synced');
          setSynced(true);
          return;
        }

        setSyncing(true);
        try {
          console.log('🔄 Syncing wallet to backend:', address);
          const result = await api.syncWallet(address);
          console.log('✅ Wallet sync successful:', result);
          setSynced(true);
        } catch (error: unknown) {
          console.error('❌ Wallet sync failed:', error instanceof Error ? error.message : error);
          
          // Don't retry if wallet already exists
          if (error instanceof Error && error.message?.includes('already registered')) {
            console.log('⚠️ Wallet already registered to another account');
            setSynced(true);
          }
        } finally {
          setSyncing(false);
        }
      }
    };

    syncWallet();
  }, [address, isConnected, isAuthenticated, user, syncing]);

  // Reset synced state when wallet address changes
  useEffect(() => {
    setSynced(false);
  }, [address]);

  return null; 
}