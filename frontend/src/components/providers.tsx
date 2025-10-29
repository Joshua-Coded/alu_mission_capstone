"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "@/contexts/AuthContext";
import { config } from "@/lib/wagmi";

// ✅ UPDATED: Added Polygon purple accents
const theme = extendTheme({
  colors: {
    brand: {
      50: '#E8F5E8',
      100: '#C6E6C6',
      200: '#9DD49D',
      300: '#74C274',
      400: '#4BB04B',
      500: '#2E8B57',
      600: '#257A4A',
      700: '#1C693C',
      800: '#13582F',
      900: '#0A4721',
    },
    // ✅ Added Polygon purple theme
    polygon: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6', // Main purple
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30000,
      },
    },
  }), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          
          modalSize="compact"
        >
          <ChakraProvider theme={theme}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}