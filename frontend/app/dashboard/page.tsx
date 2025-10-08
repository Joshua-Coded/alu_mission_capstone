"use client";
import { Box, Container, Spinner, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Redirect based on user role
      switch (user?.role) {
        case 'FARMER':
          router.push('/dashboard/farmer');
          break;
        case 'INVESTOR':
          router.push('/dashboard/investor');
          break;
        case 'GOVERNMENT_OFFICIAL':
          router.push('/dashboard/government');
          break;
        default:
          router.push('/auth/login');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Loading state while determining redirect
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, brand.50, green.50, blue.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="md" centerContent>
        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px"
          borderColor="gray.200"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Spinner
              size="xl"
              color="brand.500"
              thickness="4px"
            />
            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="semibold" color="brand.600">
                Loading Dashboard
              </Text>
              <Text fontSize="sm" color="gray.500">
                Redirecting to your personalized dashboard...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}