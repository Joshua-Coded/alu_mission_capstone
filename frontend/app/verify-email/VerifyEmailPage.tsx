"use client";
import React, { useEffect, useState } from "react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowRight, FiHome, FiMail, FiUserPlus } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

import {
  Box,
  Container,
  VStack,
  Text,
  Button,
  Icon,
  Spinner,
  useColorModeValue,
  Flex,
  Badge,
  Divider,
  Link,
  Stack,
  useToast
} from '@chakra-ui/react';

type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();
  const toast = useToast();

  // Theme colors
  const bgGradient = useColorModeValue(
    'linear(to-br, brand.50, green.50, blue.50)',
    'linear(to-br, gray.900, brand.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('invalid');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully! Welcome to our platform.');
        
        toast({
          title: "Email Verified!",
          description: "You can now access all features of your account.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              router.push('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);
        
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error 
            ? error.message 
            : 'Verification failed. Please try again or contact support.'
        );
        
        toast({
          title: "Verification Failed",
          description: "There was an issue verifying your email. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, router, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Spinner size="xl" color="brand.500" thickness="4px" />;
      case 'success':
        return <Icon as={CheckCircleIcon} boxSize={16} color="green.500" />;
      case 'error':
      case 'invalid':
        return <Icon as={WarningIcon} boxSize={16} color="red.500" />;
      default:
        return <Icon as={FiMail} boxSize={16} color="gray.500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'brand.500';
      case 'success':
        return 'green.500';
      case 'error':
      case 'invalid':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'invalid':
        return 'Invalid Verification Link';
      default:
        return 'Email Verification';
    }
  };

  const getBadgeStatus = () => {
    switch (status) {
      case 'loading':
        return { colorScheme: 'blue', text: 'Processing' };
      case 'success':
        return { colorScheme: 'green', text: 'Verified' };
      case 'error':
        return { colorScheme: 'red', text: 'Failed' };
      case 'invalid':
        return { colorScheme: 'red', text: 'Invalid' };
      default:
        return { colorScheme: 'gray', text: 'Unknown' };
    }
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={8}>
      <Container maxW="md" centerContent>
        <VStack spacing={8} align="center" w="full">
          {/* Main Verification Card */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            border="1px"
            borderColor={borderColor}
            w="full"
            maxW="md"
          >
            <VStack spacing={6} textAlign="center">
              {/* Status Badge */}
              <Badge
                colorScheme={getBadgeStatus().colorScheme}
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {getBadgeStatus().text}
              </Badge>

              {/* Status Icon */}
              <Box>
                {getStatusIcon()}
              </Box>

              {/* Title */}
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={getStatusColor()}
                lineHeight="short"
              >
                {getTitle()}
              </Text>

              {/* Message */}
              <Text
                color={textColor}
                fontSize="md"
                lineHeight="tall"
                maxW="sm"
              >
                {message}
              </Text>

              {/* Success State - Countdown */}
              {status === 'success' && (
                <Box
                  bg="green.50"
                  border="1px"
                  borderColor="green.200"
                  borderRadius="lg"
                  p={4}
                  w="full"
                >
                  <VStack spacing={3}>
                    <Text fontSize="sm" color="green.700" fontWeight="medium">
                      🎉 Welcome to the platform!
                    </Text>
                    <Button
                      colorScheme="green"
                      size="lg"
                      rightIcon={<FiArrowRight />}
                      onClick={() => router.push('/dashboard')}
                      w="full"
                    >
                      Go to Dashboard
                    </Button>
                    <Text fontSize="xs" color="green.600">
                      Auto-redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Error/Invalid State - Actions */}
              {(status === 'error' || status === 'invalid') && (
                <VStack spacing={4} w="full">
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} w="full">
                    <Button
                      colorScheme="brand"
                      leftIcon={<FiHome />}
                      onClick={() => router.push('/auth/login')}
                      flex={1}
                    >
                      Go to Login
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="brand"
                      leftIcon={<FiUserPlus />}
                      onClick={() => router.push('/auth/register')}
                      flex={1}
                    >
                      Sign Up Again
                    </Button>
                  </Stack>
                </VStack>
              )}

              {/* Loading State */}
              {status === 'loading' && (
                <Box
                  bg="brand.50"
                  border="1px"
                  borderColor="brand.200"
                  borderRadius="lg"
                  p={4}
                  w="full"
                >
                  <Flex align="center" justify="center" gap={3}>
                    <Spinner size="sm" color="brand.500" />
                    <Text fontSize="sm" color="brand.700" fontWeight="medium">
                      Please wait while we verify your email...
                    </Text>
                  </Flex>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Help Section */}
          {(status === 'error' || status === 'invalid') && (
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              w="full"
              maxW="md"
            >
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  Need Help?
                </Text>
                <Divider />
                <Text fontSize="sm" color={textColor} textAlign="center">
                  If you continue to have issues, please contact our support team at{' '}
                  <Link
                    href="mailto:support@example.com"
                    color="brand.500"
                    fontWeight="medium"
                    _hover={{ color: 'brand.600', textDecoration: 'underline' }}
                  >
                    support@example.com
                  </Link>
                </Text>
                <Badge colorScheme="gray" fontSize="xs">
                  We're here to help 24/7
                </Badge>
              </VStack>
            </Box>
          )}

          {/* Info Card */}
          <Box
            bg="whiteAlpha.800"
            backdropFilter="blur(10px)"
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor="whiteAlpha.300"
            w="full"
            maxW="md"
          >
            <Text fontSize="sm" color="gray.600" textAlign="center">
              💡 Verification links are valid for 24 hours and can only be used once for security.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}