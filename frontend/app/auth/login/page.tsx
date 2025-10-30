"use client";
import * as yup from "yup";
import NextLink from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../../src/contexts/AuthContext";
import type { LoginData } from "../../../src/lib/api";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Link,
  HStack,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  Image,
} from '@chakra-ui/react';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" boxShadow="sm">
        <Container maxW="7xl">
          <HStack h={16} spacing={4}>
            <IconButton
              icon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => router.push('/')}
              aria-label="Go back"
            />
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              🌱 RootRise
            </Text>
          </HStack>
        </Container>
      </Box>

      <Container maxW="md" py={12}>
        <VStack spacing={8}>
          {/* Logo and Title */}
          <VStack spacing={4} textAlign="center">
            <Image
              src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120&q=80"
              alt="RootRise"
              borderRadius="lg"
              w={32}
              h={20}
              objectFit="cover"
            />
            <Heading size="lg" color="gray.800">
              Welcome Back
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Sign in to your RootRise account
            </Text>
          </VStack>

          {/* Login Form */}
          <Box w="full" p={8} borderRadius="xl" boxShadow="lg" bg="white">
            {error && (
              <Alert status="error" mb={6} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={6}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize="md" fontWeight="semibold">
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    size="lg"
                    {...register('email')}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #2E8B57' }}
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontSize="md" fontWeight="semibold">
                    Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      size="lg"
                      {...register('password')}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #2E8B57' }}
                    />
                    <InputRightElement h="full">
                      <IconButton
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  py={6}
                  fontSize="md"
                  fontWeight="semibold"
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Box mt={8}>
              <Divider />
              <Text textAlign="center" mt={6} color="gray.600">
                Don&apos;t have an account?{' '}
                <Link as={NextLink} href="/auth/register" color="brand.500" fontWeight="semibold">
                  Create one here
                </Link>
              </Text>
            </Box>
          </Box>

          {/* Additional Help */}
          <VStack spacing={4} textAlign="center">
            <Text color="gray.500" fontSize="sm">
              Forgot your password?{' '}
              <Link color="brand.500" fontWeight="semibold">
                Reset it here
              </Link>
            </Text>
            <Text color="gray.400" fontSize="xs" maxW="md">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}