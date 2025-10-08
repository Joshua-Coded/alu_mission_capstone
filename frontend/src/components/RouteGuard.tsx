"use client";
import { Box, Container, Spinner, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('FARMER' | 'INVESTOR' | 'GOVERNMENT_OFFICIAL')[];
  requireEmailVerification?: boolean;
}

export default function RouteGuard({ 
  children, 
  allowedRoles = [], 
  requireEmailVerification = true 
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      // Email not verified and verification required
      if (requireEmailVerification && user && !user.emailVerified) {
        router.push('/verify-email-prompt');
        return;
      }

      // Role not allowed
      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as any)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, router, allowedRoles, requireEmailVerification]);

  // Show loading while checking authentication
  if (isLoading) {
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
                  Authenticating
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Please wait while we verify your access...
                </Text>
              </VStack>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  // Show loading if user data is not yet available
  if (!user) {
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
                  Preparing your personalized experience...
                </Text>
              </VStack>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}