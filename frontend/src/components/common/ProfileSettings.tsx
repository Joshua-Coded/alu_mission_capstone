"use client";
import React, { useState } from "react";

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Avatar,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  SimpleGrid,
  IconButton,
  useToast,
  Badge,
  Textarea,
  Switch,
  InputGroup,
  InputLeftAddon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
} from '@chakra-ui/react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiSave,
  FiShield,
  FiSettings,
  FiEdit3,
  FiLock,
  FiCreditCard,
} from 'react-icons/fi';

interface ProfileSettingsProps {
  userType: 'farmer' | 'investor' | 'government' | 'contributor';
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    profileImage?: string;
    bio?: string;
    verified?: boolean;
    walletAddress?: string;
  };
  onSave?: (data: any) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userType,
  userData,
  onSave,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    location: userData?.location || '',
    bio: userData?.bio || '',
    profileImage: userData?.profileImage || '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    projectUpdates: true,
    investmentAlerts: true,
    twoFactorAuth: false,
    publicProfile: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 3000,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            profileImage: e.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'farmer': return 'Verified Farmer';
      case 'investor': return 'Verified Investor';
      case 'government': return 'Government Official';
      case 'contributor': return 'Contributor';
      default: return 'User';
    }
  };

  const getUserTypeColor = () => {
    switch (userType) {
      case 'farmer': return 'green';
      case 'investor': return 'blue';
      case 'government': return 'purple';
      case 'contributor': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor} h="fit-content">
      <CardHeader>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <HStack spacing={3}>
              <Heading size="md" color="brand.600">
                Profile & Settings
              </Heading>
              <Badge colorScheme={getUserTypeColor()} px={3} py={1}>
                {getUserTypeLabel()}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              Manage your profile information and account settings
            </Text>
          </VStack>
        </Flex>
      </CardHeader>

      <CardBody>
        <Tabs colorScheme="brand" variant="enclosed">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FiUser />
                <Text>Profile</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiSettings />
                <Text>Settings</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiShield />
                <Text>Security</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                {/* Header with Edit Button */}
                <Flex justify="space-between" align="center">
                  <Heading size="sm">Profile Information</Heading>
                  <HStack spacing={2}>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              firstName: userData?.firstName || '',
                              lastName: userData?.lastName || '',
                              email: userData?.email || '',
                              phone: userData?.phone || '',
                              location: userData?.location || '',
                              bio: userData?.bio || '',
                              profileImage: userData?.profileImage || '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          leftIcon={<FiSave />}
                          onClick={handleSave}
                          isLoading={isSaving}
                          loadingText="Saving..."
                          bgGradient="linear(to-r, brand.400, brand.600)"
                          _hover={{
                            bgGradient: "linear(to-r, brand.500, brand.700)",
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        leftIcon={<FiEdit3 />}
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </HStack>
                </Flex>

                <Divider />

                {/* Profile Picture Section */}
                <VStack spacing={4}>
                  <Box position="relative">
                    <Avatar
                      size="2xl"
                      name={`${formData.firstName} ${formData.lastName}`}
                      src={formData.profileImage}
                      bg="brand.500"
                    />
                    {isEditing && (
                      <IconButton
                        icon={<FiCamera />}
                        aria-label="Upload photo"
                        size="sm"
                        colorScheme="brand"
                        borderRadius="full"
                        position="absolute"
                        bottom={0}
                        right={0}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      />
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </Box>
                  <VStack spacing={1}>
                    <Text fontSize="xl" fontWeight="bold">
                      {formData.firstName} {formData.lastName}
                    </Text>
                    {userData?.verified && (
                      <HStack spacing={1} color="green.500">
                        <FiShield />
                        <Text fontSize="sm">Verified Account</Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>

                <Divider />

                {/* Form Fields */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired isInvalid={!!errors.firstName}>
                    <FormLabel>First Name</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>
                        <FiUser />
                      </InputLeftAddon>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        isReadOnly={!isEditing}
                        placeholder="John"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.lastName}>
                    <FormLabel>Last Name</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>
                        <FiUser />
                      </InputLeftAddon>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        isReadOnly={!isEditing}
                        placeholder="Doe"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email Address</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>
                        <FiMail />
                      </InputLeftAddon>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        isReadOnly={!isEditing}
                        placeholder="john@example.com"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>
                        <FiPhone />
                      </InputLeftAddon>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        isReadOnly={!isEditing}
                        placeholder="+250 123 456 789"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl gridColumn={{ md: 'span 2' }}>
                    <FormLabel>Location</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>
                        <FiMapPin />
                      </InputLeftAddon>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        isReadOnly={!isEditing}
                        placeholder="Kigali, Rwanda"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl gridColumn={{ md: 'span 2' }}>
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      isReadOnly={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      resize="vertical"
                    />
                    <FormHelperText>
                      Brief description about yourself (max 500 characters)
                    </FormHelperText>
                  </FormControl>
                </SimpleGrid>

                {userData?.walletAddress && (
                  <>
                    <Divider />
                    <FormControl>
                      <FormLabel>Wallet Address</FormLabel>
                      <InputGroup>
                        <InputLeftAddon>
                          <FiCreditCard />
                        </InputLeftAddon>
                        <Input
                          value={userData.walletAddress}
                          isReadOnly
                          fontFamily="mono"
                          fontSize="sm"
                        />
                      </InputGroup>
                      <FormHelperText>
                        Your connected wallet address (cannot be changed)
                      </FormHelperText>
                    </FormControl>
                  </>
                )}
              </VStack>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="sm">Notification Preferences</Heading>
                <Divider />

                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Email Notifications</Text>
                      <Text fontSize="sm" color="gray.600">
                        Receive updates via email
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="brand"
                      isChecked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))
                      }
                    />
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">SMS Notifications</Text>
                      <Text fontSize="sm" color="gray.600">
                        Receive updates via SMS
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="brand"
                      isChecked={settings.smsNotifications}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          smsNotifications: e.target.checked,
                        }))
                      }
                    />
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Project Updates</Text>
                      <Text fontSize="sm" color="gray.600">
                        Notifications about project progress
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="brand"
                      isChecked={settings.projectUpdates}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          projectUpdates: e.target.checked,
                        }))
                      }
                    />
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">Investment Alerts</Text>
                      <Text fontSize="sm" color="gray.600">
                        Notifications about investments
                      </Text>
                    </VStack>
                    <Switch
                      colorScheme="brand"
                      isChecked={settings.investmentAlerts}
                      onChange={(e) =>
                        setSettings(prev => ({
                          ...prev,
                          investmentAlerts: e.target.checked,
                        }))
                      }
                    />
                  </HStack>
                </VStack>

                <Heading size="sm" mt={6}>Privacy Settings</Heading>
                <Divider />

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Public Profile</Text>
                    <Text fontSize="sm" color="gray.600">
                      Allow others to view your profile
                    </Text>
                  </VStack>
                  <Switch
                    colorScheme="brand"
                    isChecked={settings.publicProfile}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        publicProfile: e.target.checked,
                      }))
                    }
                  />
                </HStack>
              </VStack>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="sm">Security Settings</Heading>
                <Divider />

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Two-Factor Authentication</Text>
                    <Text fontSize="sm" color="gray.600">
                      Add an extra layer of security
                    </Text>
                  </VStack>
                  <Switch
                    colorScheme="brand"
                    isChecked={settings.twoFactorAuth}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        twoFactorAuth: e.target.checked,
                      }))
                    }
                  />
                </HStack>

                <Divider />

                <FormControl>
                  <FormLabel>Change Password</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                    <Button 
                      colorScheme="brand" 
                      leftIcon={<FiLock />}
                      bgGradient="linear(to-r, brand.400, brand.600)"
                      _hover={{
                        bgGradient: "linear(to-r, brand.500, brand.700)",
                      }}
                    >
                      Update Password
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default ProfileSettings;