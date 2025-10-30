"use client";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiCheck, FiMail } from "react-icons/fi";

import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertDescription,
  Link,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // TODO: Implement forgot password API call when backend supports it
        // await api.forgotPassword(values.email);
        
        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsSubmitted(true);
        toast({
          title: "Reset Email Sent",
          description: `If an account with ${values.email} exists, you&apos;ll receive password reset instructions.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send reset email. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (isSubmitted) {
    return (
      <Box
        minH="100vh"
        bgGradient="linear(to-br, brand.50, green.50, blue.50)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Container maxW="md" centerContent>
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            border="1px"
            borderColor={borderColor}
            textAlign="center"
            w="full"
          >
            <VStack spacing={6}>
              <Icon as={FiCheck} boxSize={16} color="green.500" />
              <Heading size="lg" color="green.600">
                Check Your Email
              </Heading>
              <VStack spacing={3}>
                <Text color="gray.600" fontSize="md" lineHeight="tall">
                  If an account with <strong>{formik.values.email}</strong> exists, 
                  you&apos;ll receive password reset instructions shortly.
                </Text>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Check your spam folder if you don&apos;t see the email within a few minutes.
                  </AlertDescription>
                </Alert>
              </VStack>
              <VStack spacing={3} w="full">
                <Button
                  colorScheme="brand"
                  onClick={() => router.push('/auth/login')}
                  w="full"
                >
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  colorScheme="gray"
                  onClick={() => setIsSubmitted(false)}
                  w="full"
                >
                  Try Different Email
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, brand.50, green.50, blue.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md" centerContent>
        <Box
          bg={cardBg}
          p={8}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px"
          borderColor={borderColor}
          w="full"
        >
          <VStack spacing={6}>
            {/* Header */}
            <VStack spacing={3} textAlign="center">
              <Icon as={FiMail} boxSize={12} color="brand.500" />
              <Heading size="lg" color="brand.600">
                Reset Your Password
              </Heading>
              <Text color="gray.600" fontSize="md">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>
            </VStack>

            {/* Form */}
            <Box w="full">
              <form onSubmit={formik.handleSubmit}>
                <VStack spacing={4}>
                  <FormControl 
                    isInvalid={formik.touched.email && !!formik.errors.email}
                  >
                    <FormLabel htmlFor="email" color="gray.700" fontWeight="medium">
                      Email Address
                    </FormLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      size="lg"
                      borderRadius="lg"
                      focusBorderColor="brand.500"
                      bg="white"
                    />
                    <FormErrorMessage>
                      {formik.errors.email}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Sending Reset Email..."
                    borderRadius="lg"
                  >
                    Send Reset Email
                  </Button>
                </VStack>
              </form>
            </Box>

            {/* Back to Login */}
            <VStack spacing={4} w="full">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                colorScheme="gray"
                w="full"
                onClick={() => router.push('/auth/login')}
              >
                Back to Login
              </Button>

              {/* Help Text */}
              <Box pt={4} borderTop="1px" borderColor={borderColor} w="full">
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Remember your password?{' '}
                  <Link
                    color="brand.500"
                    fontWeight="medium"
                    onClick={() => router.push('/auth/login')}
                    _hover={{ color: 'brand.600', textDecoration: 'underline' }}
                  >
                    Sign in here
                  </Link>
                </Text>
              </Box>
            </VStack>

            {/* Security Notice */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                For security reasons, we&apos;ll send reset instructions only if an account with this email exists.
              </AlertDescription>
            </Alert>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}