// ============================================
// FILE: components/government/DashboardHeader.tsx
// ============================================
import {
    Box,
    Container,
    Flex,
    HStack,
    VStack,
    Heading,
    Text,
    Avatar,
    Badge,
    Button,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { ConnectButton } from '@rainbow-me/rainbowkit';
  
  interface DashboardHeaderProps {
    firstName: string;
    lastName: string;
    address?: string;
    onLogout: () => void;
  }
  
  export default function DashboardHeader({ 
    firstName, 
    lastName, 
    address, 
    onLogout 
  }: DashboardHeaderProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Box bg={cardBg} borderBottom="1px" borderColor={borderColor} py={4}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Avatar size="md" name={`${firstName} ${lastName}`} bg="purple.500" />
              <VStack align="start" spacing={0}>
                <Heading size="md" color="purple.600">
                  Welcome, {firstName}!
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Government Dashboard • {new Date().toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                Government Official
              </Badge>
              {address && (
                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </Text>
              )}
              <ConnectButton />
              <Button colorScheme="purple" variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  }
  