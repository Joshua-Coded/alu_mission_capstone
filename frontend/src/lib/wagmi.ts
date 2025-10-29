import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RootRise - Agricultural Crowdfunding",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [polygon],
  transports: {
    [polygon.id]: http("https://polygon-rpc.com"),
  },
  ssr: true,
});

// ✅ Contract address from env
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ROOTRISE_CONTRACT as `0x${string}`;

// ✅ Network configuration
export const POLYGON_MAINNET = {
  id: 137,
  name: "Polygon Mainnet",
  currency: "MATIC",
  explorer: "https://polygonscan.com",
  rpc: "https://polygon-rpc.com",
} as const;

// ✅ HELPER FUNCTIONS (These were missing!)

/**
 * Get network info by chain ID
 */
export function getNetworkInfo(chainId: number) {
  if (chainId === 137) {
    return POLYGON_MAINNET;
  }
  return null;
}

/**
 * Check if network is production (Polygon Mainnet)
 */
export function isProductionNetwork(chainId: number): boolean {
  return chainId === 137;
}

/**
 * Check if network is testnet
 */
export function isTestnetNetwork(chainId: number): boolean {
  return chainId === 80001 || chainId === 11155111;
}

/**
 * Get contract address for current network
 */
export function getContractAddress(chainId: number): `0x${string}` | undefined {
  // Only return address if on Polygon Mainnet
  if (chainId === 137) {
    return CONTRACT_ADDRESS;
  }
  return undefined;
}