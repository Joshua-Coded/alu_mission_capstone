"use client";
import * as yup from "yup";
import NextLink from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCheck, FiDollarSign, FiEye, FiEyeOff, FiMail, FiMapPin, FiShield, FiUser } from "react-icons/fi";
import { useAuth } from "../../../src/contexts/AuthContext";
import type { RegisterData } from "../../../src/lib/api";
import { GovernmentDepartment, ProjectCategory, UserRole } from "../../../src/lib/api";

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
  Badge,
  Icon,
  useToast,
  Checkbox,
  FormHelperText,
  Textarea,
} from '@chakra-ui/react';

// ==================== VALIDATION SCHEMA ====================
const baseRegisterSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string()
    .matches(/^\+?[\d\s-()]{10,15}$/, 'Invalid phone number format')
    .required('Phone number is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  role: yup.string().oneOf(Object.values(UserRole)).required('Role is required'),
});

const governmentSchema = baseRegisterSchema.concat(
  yup.object({
    department: yup.string().required('Department is required'),
    specializations: yup.array().min(1, 'Select at least one specialization').required(),
    bio: yup.string().max(500, 'Bio must be less than 500 characters'),
    location: yup.string().required('Location is required'),
    mobileMoneyAccount: yup.string().optional(),
  })
);

const farmerInvestorSchema = baseRegisterSchema.concat(
  yup.object({
    location: yup.string().required('Location is required'),
    walletAddress: yup.string()
      .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')
      .optional()
      .nullable(),
    mobileMoneyAccount: yup.string().optional(),
  })
);

type RegisterFormData = yup.InferType<typeof baseRegisterSchema> & {
  department?: GovernmentDepartment;
  specializations?: ProjectCategory[];
  bio?: string;
  walletAddress?: string;
  mobileMoneyAccount?: string;
  location: string;
  termsAccepted: boolean;
};

const roleOptions = [
  {
    value: UserRole.FARMER,
    title: 'Farmer',
    description: 'Create projects and receive funding for agricultural initiatives',
    icon: FiUser,
    color: 'green',
    schema: farmerInvestorSchema,
  },
  {
    value: UserRole.INVESTOR,
    title: 'Investor',
    description: 'Fund agricultural projects and track their progress',
    icon: FiDollarSign,
    color: 'blue',
    schema: farmerInvestorSchema,
  },
  {
    value: UserRole.GOVERNMENT_OFFICIAL,
    title: 'Government Official',
    description: 'Monitor, review, and approve agricultural projects for compliance',
    icon: FiShield,
    color: 'purple',
    schema: governmentSchema,
  },
];

// ==================== MAIN COMPONENT ====================
export default function RegisterPage() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.FARMER);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const currentSchema = roleOptions.find(r => r.value === selectedRole)?.schema || baseRegisterSchema;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(currentSchema as any),
    defaultValues: {
      role: UserRole.FARMER,
      termsAccepted: false,
      location: '',
    }
  });

  const watchedRole = watch('role');

  // Reset form when role changes
  useEffect(() => {
    if (watchedRole && watchedRole !== selectedRole) {
      setSelectedRole(watchedRole as UserRole);
      reset();
      setValue('role', watchedRole as UserRole);
    }
  }, [watchedRole, selectedRole, reset, setValue]);

  const onRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
    setError('');
    
    reset({
      role,
      termsAccepted: false,
    });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
  
    try {
      console.log('📝 Registering user with role:', selectedRole, data);
  
      const termsAccepted = Boolean(data.termsAccepted);
  
      const registerData: RegisterData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: selectedRole,
        termsAccepted: termsAccepted,
        location: data.location,
        ...(selectedRole === UserRole.GOVERNMENT_OFFICIAL && {
          department: data.department as GovernmentDepartment,
          specializations: data.specializations || [],
          bio: data.bio,
        }),
        ...([UserRole.FARMER, UserRole.INVESTOR].includes(selectedRole) && {
          walletAddress: data.walletAddress || undefined,
          mobileMoneyAccount: data.mobileMoneyAccount || undefined,
        }),
      };
  
      console.log('📤 Sending registration data:', registerData);
  
      await registerUser(registerData);
      
      setIsRegistered(true);
      setRegisteredEmail(data.email);
      
      toast({
        title: "Registration Successful!",
        description: `Welcome to RootRise! Please check ${data.email} for your verification link.`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
  
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isRegistered) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
          <Container maxW="7xl">
            <HStack h={16} spacing={4} justify="center">
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
                <Box bg="green.100" p={4} borderRadius="full">
                  <Icon as={FiCheck} boxSize={12} color="green.500" />
                </Box>
                <VStack spacing={3}>
                  <Heading size="lg" color="green.600">Registration Successful!</Heading>
                  <Text fontSize="lg" color="gray.600">
                    Welcome to RootRise! Your {selectedRole} account has been created.
                  </Text>
                </VStack>
                <Alert status="info" borderRadius="lg" p={6} w="full">
                  <AlertIcon />
                  <Box textAlign="left">
                    <AlertTitle fontSize="md" mb={2}>Email Verification Required</AlertTitle>
                    <AlertDescription fontSize="sm">
                      We've sent a verification link to <strong>{registeredEmail}</strong>. 
                      Click the link to activate your account and access the {selectedRole} dashboard.
                    </AlertDescription>
                  </Box>
                </Alert>
                <VStack spacing={3} w="full">
                  <Button
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    onClick={() => router.push('/auth/login')}
                  >
                    Go to Login
                  </Button>
                </VStack>
                <Box pt={4} borderTop="1px" borderColor="gray.200" w="full">
                  <Text fontSize="sm" color="gray.500">
                    Didn't receive the email? Check your spam folder or contact support.
                  </Text>
                </Box>
              </VStack>
            </Box>
            <Box bg="brand.50" p={4} borderRadius="lg" textAlign="center">
              <Text fontSize="sm" color="brand.700">
                <Icon as={FiShield} mr={2} />
                Your data is secure and encrypted. We prioritize your privacy.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Main registration form
  return (
    <Box minH="100vh" bg="gray.50">
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
          <VStack spacing={4} textAlign="center">
            <Image
              src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120&q=80"
              alt="RootRise"
              borderRadius="lg"
              w={32}
              h={20}
              objectFit="cover"
              fallbackSrc="/logo-placeholder.png"
            />
            <Heading size="lg" color="gray.800">Join RootRise</Heading>
            <Text color="gray.600" fontSize="lg">
              Create your account and transform agriculture in Rwanda
            </Text>
          </VStack>

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
                    Select Your Role
                  </FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {roleOptions.map((roleOption) => {
                      const isSelected = selectedRole === roleOption.value;
                      return (
                        <Box
                          key={roleOption.value}
                          p={4}
                          borderWidth={2}
                          borderRadius="lg"
                          cursor="pointer"
                          borderColor={isSelected ? `${roleOption.color}.500` : 'gray.200'}
                          bg={isSelected ? `${roleOption.color}.50` : 'white'}
                          _hover={{ borderColor: `${roleOption.color}.300`, bg: `${roleOption.color}.50` }}
                          transition="all 0.2s"
                          onClick={() => onRoleSelect(roleOption.value as UserRole)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                        >
                          <input
                            type="radio"
                            {...register('role')}
                            value={roleOption.value}
                            style={{ display: 'none' }}
                          />
                          <VStack spacing={3} align="center" textAlign="center">
                            <Box
                              p={3}
                              borderRadius="full"
                              bg={isSelected ? `${roleOption.color}.100` : 'gray.100'}
                              borderWidth={isSelected ? 2 : 0}
                              borderColor={isSelected ? `${roleOption.color}.500` : 'transparent'}
                            >
                              <Icon as={roleOption.icon} boxSize={6} color={isSelected ? `${roleOption.color}.600` : 'gray.600'} />
                            </Box>
                            <Text fontWeight="semibold" fontSize="md">{roleOption.title}</Text>
                            <Text fontSize="sm" color="gray.600">{roleOption.description}</Text>
                            {isSelected && (
                              <Badge colorScheme={roleOption.color} fontSize="xs">
                                Selected
                              </Badge>
                            )}
                          </VStack>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                  <FormErrorMessage mt={2}>{errors.role?.message}</FormErrorMessage>
                </FormControl>

                {/* Common Fields */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isInvalid={!!errors.firstName}>
                    <FormLabel>First Name *</FormLabel>
                    <Input
                      placeholder="John"
                      size="lg"
                      {...register('firstName')}
                    />
                    <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.lastName}>
                    <FormLabel>Last Name *</FormLabel>
                    <Input
                      placeholder="Doe"
                      size="lg"
                      {...register('lastName')}
                    />
                    <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email Address *</FormLabel>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      size="lg"
                      {...register('email')}
                    />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phoneNumber}>
                  <FormLabel>Phone Number *</FormLabel>
                  <Input
                    type="tel"
                    placeholder="+250 788 123 456"
                    size="lg"
                    {...register('phoneNumber')}
                  />
                  <FormHelperText>Rwanda phone number with country code</FormHelperText>
                  <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
                </FormControl>

                {/* Role-Specific Fields */}
                {selectedRole === UserRole.GOVERNMENT_OFFICIAL ? (
                  <>
                    <FormControl isInvalid={!!errors.department}>
                      <FormLabel>Department *</FormLabel>
                      <Select 
                        placeholder="Select department" 
                        size="lg"
                        {...register('department')}
                      >
                        {Object.values(GovernmentDepartment).map(dept => (
                          <option key={dept} value={dept}>
                            {dept.charAt(0) + dept.slice(1).toLowerCase().replace(/_/g, ' ')}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText>Your primary department/specialization</FormHelperText>
                      <FormErrorMessage>{errors.department?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.specializations}>
                      <FormLabel>Specializations *</FormLabel>
                      <Select 
                        placeholder="Select project categories you specialize in" 
                        size="lg"
                        {...register('specializations')}
                        multiple
                      >
                        {Object.values(ProjectCategory).map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0) + cat.slice(1).toLowerCase().replace(/_/g, ' ')}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText>Hold Ctrl/Cmd to select multiple categories</FormHelperText>
                      <FormErrorMessage>{errors.specializations?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.bio}>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <Textarea
                        placeholder="Brief description of your experience and role..."
                        rows={3}
                        size="lg"
                        {...register('bio')}
                        maxLength={500}
                      />
                      <FormHelperText>Max 500 characters - helps with project assignments</FormHelperText>
                      <FormErrorMessage>{errors.bio?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.location}>
                      <FormLabel>Work Location *</FormLabel>
                      <Input
                        placeholder="e.g., Kigali, Rwanda or Ministry of Agriculture"
                        size="lg"
                        {...register('location')}
                      />
                      <FormHelperText>Your office location or ministry</FormHelperText>
                      <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <FormControl isInvalid={!!errors.location}>
                      <FormLabel>Location *</FormLabel>
                      <Input
                        placeholder="e.g., Kigali, Rwanda"
                        size="lg"
                        {...register('location')}
                      />
                      <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.walletAddress}>
                      <FormLabel>Ethereum Wallet Address (Optional)</FormLabel>
                      <Input
                        placeholder="0x1234...abcd"
                        size="lg"
                        {...register('walletAddress')}
                      />
                      <FormHelperText>For blockchain transactions and project funding</FormHelperText>
                      <FormErrorMessage>{errors.walletAddress?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Mobile Money Account (Optional)</FormLabel>
                      <Input
                        placeholder="MTN MoMo: 0788 123 456"
                        size="lg"
                        {...register('mobileMoneyAccount')}
                      />
                      <FormHelperText>For local payments and withdrawals</FormHelperText>
                    </FormControl>
                  </>
                )}

                {/* Password Fields */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Password *</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create strong password"
                        size="lg"
                        {...register('password')}
                      />
                      <InputRightElement>
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
                    <FormLabel>Confirm Password *</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        size="lg"
                        {...register('confirmPassword')}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                {/* Terms and Conditions */}
                <FormControl isInvalid={!!errors.termsAccepted}>
                  <Checkbox {...register('termsAccepted')}>
                    <Text fontSize="sm">
                      I agree to the <Link color="brand.500" textDecor="underline">Terms of Service</Link> and{' '}
                      <Link color="brand.500" textDecor="underline">Privacy Policy</Link>
                    </Text>
                  </Checkbox>
                  <FormErrorMessage>{errors.termsAccepted?.message}</FormErrorMessage>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText={`Creating ${selectedRole} Account...`}
                  py={6}
                  fontSize="md"
                  fontWeight="semibold"
                >
                  Create {selectedRole} Account
                </Button>
              </VStack>
            </form>

            {/* Divider and Login Link */}
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

          {/* Footer */}
          <Text color="gray.400" fontSize="xs" maxW="md" textAlign="center">
            By registering, you agree to our Terms of Service and Privacy Policy. 
            We prioritize data security and agricultural development in Rwanda.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}