import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RootRise - Agricultural Crowdfunding",
  projectId: "cd9b2e9c8b5a4f2e8d1c3a6b7e9f2d4a",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/1afeb755d8924bf4b93020cd1c72bc19"),
  },
  ssr: true,
});

export const CONTRACTS = {
  ROOTRISE: "0x1A3B56BF1DDF92a4ADDd1b897B8Ce6E678AA81bc",
  MOCK_USDC: "0xa22c9a8c9293476Fbc9D6f8053284FD226e42F48",
} as const;