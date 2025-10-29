import { useChainId } from "wagmi";

import { 
  getNetworkInfo, 
  isProductionNetwork, 
  isTestnetNetwork,
  getContractAddress 
} from "@/lib/wagmi";

export function useNetworkInfo() {
  const chainId = useChainId();
  
  return {
    chainId,
    networkInfo: getNetworkInfo(chainId),
    isProduction: isProductionNetwork(chainId),
    isTestnet: isTestnetNetwork(chainId),
    contractAddress: getContractAddress(chainId),
    isPolygon: chainId === 137,
    isMumbai: chainId === 80001,
    isSepolia: chainId === 11155111,
  };
}