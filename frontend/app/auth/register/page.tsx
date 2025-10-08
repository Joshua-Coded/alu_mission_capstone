"use client";
import * as yup from "yup";
import NextLink from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCheck, FiDollarSign, FiEye, FiEyeOff, FiMail, FiShield, FiUser } from "react-icons/fi";
import { useAuth } from "../../../src/contexts/AuthContext";
import type { RegisterData } from "../../../src/lib/api";

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
  AlertTitle,
  AlertDescription,
  Link,
  HStack,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  Image,
  Select,
  SimpleGrid,
  RadioGroup,
  Radio,
  Stack,
  Icon,
  useToast,
} from '@chakra-ui/react';

const registerSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().oneOf(['FARMER', 'INVESTOR', 'GOVERNMENT_OFFICIAL']).required('Please select a role'),
});

type RegisterFormData = RegisterData & {
  confirmPassword: string;
};

const roleOptions = [
  {
    value: 'FARMER',
    title: 'Farmer',
    description: 'Create projects and receive funding for agricultural initiatives',
    icon: FiUser,
    color: 'green'
  },
  {
    value: 'INVESTOR',
    title: 'Investor',
    description: 'Fund agricultural projects and track their progress',
    icon: FiDollarSign,
    color: 'blue'
  },
  {
    value: 'GOVERNMENT_OFFICIAL',
    title: 'Government Official',
    description: 'Monitor and approve agricultural projects',
    icon: FiShield,
    color: 'purple'
  },
];

export default function RegisterPage() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      
      // Set success state
      setIsRegistered(true);
      setRegisteredEmail(data.email);
      
      // Show success toast
      toast({
        title: "Registration Successful!",
        description: `Welcome to RootRise! Please check ${data.email} for your verification link.`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });

      // Redirect to verification prompt after a brief delay
      setTimeout(() => {
        router.push('/verify-email-prompt');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - show email verification message
  if (isRegistered) {
    return (
      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <Box bg="white" boxShadow="sm">
          <Container maxW="7xl">
            <HStack h={16} spacing={4}>
              <Text fontSize="xl" fontWeight="bold" color="brand.500">
                🌱 RootRise
              </Text>
            </HStack>
          </Container>
        </Box>

        <Container maxW="lg" py={12}>
          <VStack spacing={8}>
            <Box w="full" p={8} borderRadius="xl" boxShadow="lg" bg="white" textAlign="center">
              <VStack spacing={6}>
                {/* Success Icon */}
                <Box
                  bg="green.100"
                  p={4}
                  borderRadius="full"
                >
                  <Icon as={FiCheck} boxSize={12} color="green.500" />
                </Box>

                {/* Success Message */}
                <VStack spacing={3}>
                  <Heading size="lg" color="green.600">
                    Registration Successful!
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    Welcome to RootRise, we're excited to have you join our community!
                  </Text>
                </VStack>

                {/* Email Verification Instructions */}
                <Alert status="info" borderRadius="lg" p={6}>
                  <AlertIcon as={FiMail} boxSize={6} />
                  <Box textAlign="left">
                    <AlertTitle fontSize="md" mb={2}>
                      Please verify your email address
                    </AlertTitle>
                    <AlertDescription fontSize="sm" lineHeight="tall">
                      We've sent a verification link to <strong>{registeredEmail}</strong>. 
                      Click the link in the email to activate your account and access your dashboard.
                    </AlertDescription>
                  </Box>
                </Alert>

                {/* Action Buttons */}
                <VStack spacing={3} w="full">
                  <Button
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    onClick={() => router.push('/verify-email-prompt')}
                  >
                    Continue to Email Verification
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    size="md"
                    onClick={() => router.push('/auth/login')}
                  >
                    Go to Login
                  </Button>
                </VStack>

                {/* Help Text */}
                <Box pt={4} borderTop="1px" borderColor="gray.200" w="full">
                  <Text fontSize="sm" color="gray.500">
                    Didn't receive the email? Check your spam folder or{' '}
                    <Link color="brand.500" fontWeight="medium">
                      resend verification email
                    </Link>
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Additional Info */}
            <Box bg="brand.50" p={4} borderRadius="lg" textAlign="center">
              <Text fontSize="sm" color="brand.700">
                <Icon as={FiShield} mr={2} />
                Your account is secure. We'll never share your information with third parties.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Registration form
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

      <Container maxW="2xl" py={12}>
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
              Join RootRise Today
            </Heading>
            <Text color="gray.600" fontSize="lg" textAlign="center">
              Create your account and start transforming agriculture in Rwanda
            </Text>
          </VStack>

          {/* Registration Form */}
          <Box w="full" p={8} borderRadius="xl" boxShadow="lg" bg="white">
            {error && (
              <Alert status="error" mb={6} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={6}>
                {/* Role Selection */}
                <FormControl isInvalid={!!errors.role}>
                  <FormLabel fontSize="lg" fontWeight="semibold" mb={4}>
                    Choose Your Role
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {roleOptions.map((role) => (
                      <Box
                        key={role.value}
                        as="label"
                        p={4}
                        borderWidth={2}
                        borderRadius="lg"
                        cursor="pointer"
                        borderColor={selectedRole === role.value ? `${role.color}.500` : 'gray.200'}
                        bg={selectedRole === role.value ? `${role.color}.50` : 'white'}
                        _hover={{ borderColor: `${role.color}.300` }}
                        transition="all 0.2s"
                        onClick={() => {
                          // Manually set the role value
                          const event = {
                            target: { name: 'role', value: role.value }
                          };
                          register('role').onChange(event);
                        }}
                      >
                        <input
                          type="radio"
                          {...register('role')}
                          value={role.value}
                          style={{ display: 'none' }}
                        />
                        <VStack spacing={3} align="center" textAlign="center">
                          <Box
                            p={3}
                            borderRadius="full"
                            bg={selectedRole === role.value ? `${role.color}.100` : 'gray.100'}
                          >
                            <role.icon 
                              size={24} 
                              color={selectedRole === role.value ? `#2E8B57` : '#718096'} 
                            />
                          </Box>
                          <Text fontWeight="semibold" fontSize="md">
                            {role.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {role.description}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                  <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
                </FormControl>

                {/* Personal Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isInvalid={!!errors.firstName}>
                    <FormLabel fontSize="md" fontWeight="semibold">
                      First Name
                    </FormLabel>
                    <Input
                      placeholder="Enter your first name"
                      size="lg"
                      {...register('firstName')}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #2E8B57' }}
                    />
                    <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.lastName}>
                    <FormLabel fontSize="md" fontWeight="semibold">
                      Last Name
                    </FormLabel>
                    <Input
                      placeholder="Enter your last name"
                      size="lg"
                      {...register('lastName')}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #2E8B57' }}
                    />
                    <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

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

                <FormControl isInvalid={!!errors.phoneNumber}>
                  <FormLabel fontSize="md" fontWeight="semibold">
                    Phone Number
                  </FormLabel>
                  <Input
                    type="tel"
                    placeholder="+250 788 123 456"
                    size="lg"
                    {...register('phoneNumber')}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #2E8B57' }}
                  />
                  <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="md" fontWeight="semibold">
                      Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create password"
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

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontSize="md" fontWeight="semibold">
                      Confirm Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        size="lg"
                        {...register('confirmPassword')}
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #2E8B57' }}
                      />
                      <InputRightElement h="full">
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  py={6}
                  fontSize="md"
                  fontWeight="semibold"
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Box mt={8}>
              <Divider />
              <Text textAlign="center" mt={6} color="gray.600">
                Already have an account?{' '}
                <Link as={NextLink} href="/auth/login" color="brand.500" fontWeight="semibold">
                  Sign in here
                </Link>
              </Text>
            </Box>
          </Box>

          {/* Terms */}
          <Text color="gray.400" fontSize="xs" maxW="md" textAlign="center">
            By creating an account, you agree to our{' '}
            <Link color="brand.500">Terms of Service</Link> and{' '}
            <Link color="brand.500">Privacy Policy</Link>.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}