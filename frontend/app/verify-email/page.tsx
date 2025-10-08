import VerifyEmailPage from "./VerifyEmailPage";
import { Box, Container, Spinner, Text, VStack } from "@chakra-ui/react";
import { Suspense } from "react";

// Loading component for Suspense with Chakra UI
function VerifyEmailLoading() {
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
                Loading Verification Page
              </Text>
              <Text fontSize="sm" color="gray.500">
                Please wait a moment...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailPage />
    </Suspense>
  );
}