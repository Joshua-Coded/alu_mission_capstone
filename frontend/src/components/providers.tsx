"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { AuthProvider } from "@/contexts/AuthContext";
import { config } from "@/lib/wagmi";

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
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // ✅ Create QueryClient only once
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
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