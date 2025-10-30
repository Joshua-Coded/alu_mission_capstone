"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { FiGlobe, FiShield, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useAccount } from "wagmi";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Badge,
  Stack,
} from '@chakra-ui/react';

const features = [
  {
    icon: FiShield,
    title: 'Blockchain Security',
    description: 'Smart contracts ensure transparent and secure transactions for all stakeholders.',
  },
  {
    icon: FiUsers,
    title: 'Direct Connection',
    description: 'Connect farmers directly with investors, eliminating intermediaries.',
  },
  {
    icon: FiTrendingUp,
    title: 'Track Progress',
    description: 'Real-time project tracking and milestone-based funding releases.',
  },
  {
    icon: FiGlobe,
    title: 'Global Impact',
    description: 'Supporting Rwanda\'s agricultural growth through technology.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  useAccount();

  return (
    <Box>
      {/* Header */}
      <Box bg="white" boxShadow="sm">
        <Container maxW="7xl">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <HStack>
              <Text fontSize="xl" fontWeight="bold" color="brand.500">
                🌱 RootRise
              </Text>
            </HStack>
            
            <HStack spacing={4}>
              <Button variant="ghost" onClick={() => router.push('/auth/login')}>
                Sign In
              </Button>
              <Button colorScheme="brand" onClick={() => router.push('/auth/register')}>
                Get Started
              </Button>
              <ConnectButton />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Badge colorScheme="brand" px={3} py={1} borderRadius="full">
              Blockchain-Powered Agriculture
            </Badge>
            
            <Heading
              as="h1"
              size="2xl"
              maxW="4xl"
              lineHeight="shorter"
            >
            Empowering Rwanda&#39;s Farmers Through{' '}
              <Text as="span" color="brand.500">Transparent Investment</Text>
            </Heading>
            
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Connect directly with agricultural projects in Rwanda. Invest securely, 
              track progress transparently, and create lasting impact through blockchain technology.
            </Text>
            
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Button
                size="lg"
                colorScheme="brand"
                px={8}
                onClick={() => router.push('/auth/register')}
              >
                Start Investing
              </Button>
              <Button
                size="lg"
                variant="outline"
                colorScheme="brand"
                px={8}
                onClick={() => router.push('/auth/register')}
              >
                Apply as Farmer
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={16}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="brand.500">
              50+
            </Text>
            <Text color="gray.600">Active Projects</Text>
          </VStack>
          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="brand.500">
              $100K+
            </Text>
            <Text color="gray.600">Funds Raised</Text>
          </VStack>
          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="brand.500">
              200+
            </Text>
            <Text color="gray.600">Farmers Supported</Text>
          </VStack>
          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color="brand.500">
              95%
            </Text>
            <Text color="gray.600">Success Rate</Text>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* Features Section */}
      <Box bg="gray.50" py={16}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">Why Choose RootRise?</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Our platform leverages blockchain technology to create a transparent, 
                secure, and efficient agricultural investment ecosystem.
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {features.map((feature, index) => (
                <VStack
                  key={index}
                  p={6}
                  bg="white"
                  borderRadius="lg"
                  boxShadow="md"
                  spacing={4}
                  align="start"
                >
                  <Icon as={feature.icon} w={8} h={8} color="brand.500" />
                  <Heading size="md">{feature.title}</Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={8} textAlign="center">
          <Heading size="xl">Ready to Make an Impact?</Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Join our community of investors and farmers creating sustainable 
            agricultural growth in Rwanda.
          </Text>
          
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              size="lg"
              colorScheme="brand"
              px={8}
              onClick={() => router.push('/auth/register')}
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="brand"
              px={8}
              onClick={() => router.push('/how-it-works')}
            >
              Learn More
            </Button>
          </Stack>
        </VStack>
      </Container>

      {/* Footer */}
      <Box bg="gray.900" color="white" py={12}>
        <Container maxW="7xl">
          <VStack spacing={8}>
            <HStack>
              <Text fontSize="xl" fontWeight="bold">
                🌱 RootRise
              </Text>
            </HStack>
            
            <Text textAlign="center" color="gray.400">
              © 2024 RootRise. Empowering Rwanda&#39;s agricultural future through blockchain technology.
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}