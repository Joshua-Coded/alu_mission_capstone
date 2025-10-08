"use client";
import { useRouter } from "next/navigation";

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
  Image,
  Grid,
  GridItem,
  Divider,
  Link,
  IconButton,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiShield, 
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiFacebook,
  FiArrowRight,
  FiCheckCircle,
  FiStar
} from 'react-icons/fi';

const features = [
  {
    icon: FiShield,
    title: 'Blockchain Security',
    description: 'Smart contracts ensure transparent and secure transactions for all stakeholders.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    icon: FiUsers,
    title: 'Direct Connection',
    description: 'Connect farmers directly with investors, eliminating intermediaries.',
    image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    icon: FiTrendingUp,
    title: 'Track Progress',
    description: 'Real-time project tracking and milestone-based funding releases.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    icon: FiGlobe,
    title: 'Global Impact',
    description: 'Supporting Rwanda\'s agricultural growth through technology.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
];

const testimonials = [
  {
    name: 'Jean Paul Uwimana',
    role: 'Coffee Farmer, Nyanza',
    content: 'RootRise helped me expand my coffee farm and connect with international investors. The transparency is incredible.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Sarah Chen',
    role: 'Impact Investor',
    content: 'Finally, a platform where I can see exactly how my investments are making a difference in rural communities.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <Box>
      {/* Header */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={100}>
        <Container maxW="7xl">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <HStack>
              <Text fontSize="2xl" fontWeight="bold" color="brand.500">
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
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section with Background Image */}
      <Box 
        position="relative"
        minH="100vh"
        backgroundImage="linear-gradient(135deg, rgba(46, 139, 87, 0.8), rgba(34, 139, 34, 0.8)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
        backgroundSize="cover"
        backgroundPosition="center"
        color="white"
      >
        <Container maxW="7xl" h="100vh">
          <Flex align="center" h="full">
            <VStack spacing={8} textAlign="center" w="full">
              <Badge colorScheme="whiteAlpha" px={4} py={2} borderRadius="full" fontSize="md">
                🚀 Blockchain-Powered Agriculture
              </Badge>
              
              <Heading
                as="h1"
                size="3xl"
                maxW="5xl"
                lineHeight="shorter"
                textShadow="2px 2px 4px rgba(0,0,0,0.3)"
              >
                Empowering Rwanda's Farmers Through{' '}
                <Text as="span" color="yellow.300">Transparent Investment</Text>
              </Heading>
              
              <Text fontSize="xl" maxW="3xl" textShadow="1px 1px 2px rgba(0,0,0,0.3)">
                Connect directly with agricultural projects in Rwanda. Invest securely, 
                track progress transparently, and create lasting impact through blockchain technology.
              </Text>
              
              <Stack direction={{ base: 'column', md: 'row' }} spacing={6} pt={4}>
                <Button
                  size="lg"
                  colorScheme="yellow"
                  color="green.800"
                  px={8}
                  py={6}
                  fontSize="lg"
                  rightIcon={<FiArrowRight />}
                  onClick={() => router.push('/auth/register')}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                  transition="all 0.2s"
                >
                  Start Investing Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  px={8}
                  py={6}
                  fontSize="lg"
                  onClick={() => router.push('/auth/register')}
                  _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Apply as Farmer
                </Button>
              </Stack>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box bg="white" py={20}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={12}>
            {[
              { number: '250+', label: 'Active Projects', icon: FiCheckCircle },
              { number: '$2.5M+', label: 'Funds Raised', icon: FiTrendingUp },
              { number: '1,200+', label: 'Farmers Supported', icon: FiUsers },
              { number: '98%', label: 'Success Rate', icon: FiStar },
            ].map((stat, index) => (
              <VStack key={index} spacing={4}>
                <Icon as={stat.icon} w={12} h={12} color="brand.500" />
                <Text fontSize="4xl" fontWeight="bold" color="brand.500">
                  {stat.number}
                </Text>
                <Text color="gray.600" fontSize="lg" textAlign="center">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg="gray.50" py={20}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading size="2xl" color="gray.800">Why Choose RootRise?</Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl">
                Our platform leverages cutting-edge blockchain technology to create a transparent, 
                secure, and efficient agricultural investment ecosystem for everyone.
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
              {features.map((feature, index) => (
                <Box 
                  key={index}
                  bg="white"
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="lg"
                  _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl' }}
                  transition="all 0.3s"
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    h={48}
                    w="full"
                    objectFit="cover"
                  />
                  <Box p={8}>
                    <VStack spacing={4} align="start">
                      <Icon as={feature.icon} w={12} h={12} color="brand.500" />
                      <Heading size="lg">{feature.title}</Heading>
                      <Text color="gray.600" fontSize="lg">
                        {feature.description}
                      </Text>
                    </VStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box bg="white" py={20}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <Heading size="2xl" textAlign="center" color="gray.800">
              What Our Community Says
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {testimonials.map((testimonial, index) => (
                <Box
                  key={index}
                  p={8}
                  bg="gray.50"
                  borderRadius="xl"
                  position="relative"
                  boxShadow="md"
                  _hover={{ boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  <VStack spacing={6} align="start">
                    <HStack>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Icon key={i} as={FiStar} color="yellow.400" w={5} h={5} />
                      ))}
                    </HStack>
                    <Text fontSize="lg" fontStyle="italic" color="gray.700">
                      "{testimonial.content}"
                    </Text>
                    <HStack>
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        w={12}
                        h={12}
                        borderRadius="full"
                        border="2px solid"
                        borderColor="brand.200"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color="gray.800">{testimonial.name}</Text>
                        <Text color="gray.600" fontSize="sm">{testimonial.role}</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="brand.500" py={20} color="white">
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl">Ready to Transform Agriculture?</Heading>
            <Text fontSize="xl" maxW="3xl">
              Join thousands of farmers and investors who are already building a sustainable 
              agricultural future in Rwanda through blockchain technology.
            </Text>
            
            <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
              <Button
                size="lg"
                bg="white"
                color="brand.500"
                px={8}
                py={6}
                fontSize="lg"
                rightIcon={<FiArrowRight />}
                onClick={() => router.push('/auth/register')}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              >
                Get Started Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                px={8}
                py={6}
                fontSize="lg"
                onClick={() => router.push('/how-it-works')}
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                Learn How It Works
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Enhanced Footer */}
      <Box bg="gray.900" color="white" pt={16} pb={8}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={12} mb={12}>
            {/* Company Info */}
            <GridItem>
              <VStack align="start" spacing={6}>
                <HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    🌱 RootRise
                  </Text>
                </HStack>
                <Text color="gray.400" lineHeight="tall">
                  Empowering Rwanda's agricultural future through transparent, 
                  blockchain-powered investment solutions.
                </Text>
                <HStack spacing={4}>
                  <IconButton
                    as="a"
                    href="#"
                    aria-label="Twitter"
                    icon={<FiTwitter />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white', bg: 'gray.700' }}
                  />
                  <IconButton
                    as="a"
                    href="#"
                    aria-label="LinkedIn"
                    icon={<FiLinkedin />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white', bg: 'gray.700' }}
                  />
                  <IconButton
                    as="a"
                    href="#"
                    aria-label="GitHub"
                    icon={<FiGithub />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white', bg: 'gray.700' }}
                  />
                  <IconButton
                    as="a"
                    href="#"
                    aria-label="Facebook"
                    icon={<FiFacebook />}
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white', bg: 'gray.700' }}
                  />
                </HStack>
              </VStack>
            </GridItem>

            {/* Quick Links */}
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md" mb={2}>Platform</Heading>
                {['How It Works', 'Browse Projects', 'For Farmers', 'For Investors', 'Dashboard'].map((link) => (
                  <Link
                    key={link}
                    color="gray.400"
                    _hover={{ color: 'white' }}
                    transition="color 0.2s"
                  >
                    {link}
                  </Link>
                ))}
              </VStack>
            </GridItem>

            {/* Company */}
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md" mb={2}>Company</Heading>
                {['About Us', 'Our Mission', 'Team', 'Careers', 'News'].map((link) => (
                  <Link
                    key={link}
                    color="gray.400"
                    _hover={{ color: 'white' }}
                    transition="color 0.2s"
                  >
                    {link}
                  </Link>
                ))}
              </VStack>
            </GridItem>

            {/* Contact */}
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md" mb={2}>Contact Us</Heading>
                <HStack color="gray.400">
                  <Icon as={FiMapPin} />
                  <Text>Kigali, Rwanda</Text>
                </HStack>
                <HStack color="gray.400">
                  <Icon as={FiMail} />
                  <Text>hello@rootrise.rw</Text>
                </HStack>
                <HStack color="gray.400">
                  <Icon as={FiPhone} />
                  <Text>+250 788 123 456</Text>
                </HStack>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={2}>
                    Subscribe to our newsletter
                  </Text>
                  <HStack>
                    <Button size="sm" colorScheme="brand">
                      Subscribe
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </GridItem>
          </Grid>

          <Divider borderColor="gray.700" />

          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            pt={8}
            gap={4}
          >
            <Text color="gray.400" fontSize="sm">
              © 2024 RootRise. All rights reserved. Built with ❤️ for Rwanda's agricultural community.
            </Text>
            <HStack spacing={6} color="gray.400" fontSize="sm">
              <Link _hover={{ color: 'white' }}>Privacy Policy</Link>
              <Link _hover={{ color: 'white' }}>Terms of Service</Link>
              <Link _hover={{ color: 'white' }}>Cookie Policy</Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}