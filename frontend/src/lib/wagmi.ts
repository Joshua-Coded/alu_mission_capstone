import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { sepolia } from "wagmi/chains";

// Configure Sepolia with your Infura RPC
const sepoliaWithRpc = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: {
      http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/1afeb755d8924bf4b93020cd1c72bc19'],
    },
  },
};

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'RootRise',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'cd9b2e9c8b5a4f2e8d1c3a6b7e9f2d4a',
  chains: [sepoliaWithRpc],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  },
  ssr: true,
});

// Contract addresses for easy import
export const CONTRACTS = {
  ROOTRISE: process.env.NEXT_PUBLIC_ROOTRISE_CONTRACT as `0x${string}`,
  MOCK_USDC: process.env.NEXT_PUBLIC_MOCK_USDC_CONTRACT as `0x${string}`,
};