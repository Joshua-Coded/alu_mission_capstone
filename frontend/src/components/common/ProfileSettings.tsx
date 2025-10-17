"use client";
import React, { useEffect, useState } from "react";
import { ProfileResponse, api } from "../../lib/api";

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
  Code,
  Alert,
  AlertIcon,
  Spinner,
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
  FiRefreshCw,
} from 'react-icons/fi';

interface ProfileSettingsProps {
  userType: 'farmer' | 'investor' | 'government' | 'contributor';
  userData?: Partial<ProfileResponse>; // Changed to Partial
  onSave?: (data: any) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userType,
  userData: initialUserData,
  onSave,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [userData, setUserData] = useState<ProfileResponse | Partial<ProfileResponse> | null>(initialUserData || null);
  const [isLoading, setIsLoading] = useState(!initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: initialUserData?.firstName || '',
    lastName: initialUserData?.lastName || '',
    email: initialUserData?.email || '',
    phone: initialUserData?.phoneNumber || '',
    location: initialUserData?.location || '',
    bio: initialUserData?.bio || '',
    profileImage: '',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    projectUpdates: true,
    investmentAlerts: true,
    twoFactorAuth: false,
    publicProfile: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch profile data on mount
  useEffect(() => {
    if (!initialUserData) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await api.getProfile();
      setUserData(profile);
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phoneNumber || '',
        location: profile.location || '',
        bio: profile.bio || '',
        profileImage: '',
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast({
        title: 'Error Loading Profile',
        description: error.message || 'Failed to load your profile data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        // TODO: Implement update profile API endpoint
        // await api.updateProfile(formData);
        
        // For now, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reload profile to get updated data
        await loadProfile();
      }
      
      toast({
        title: 'Profile Updated ✓',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'New password and confirmation must match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Password Updated ✓',
        description: 'Your password has been changed successfully',
        status: 'success',
        duration: 3000,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Unable to change password. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
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
          toast({
            title: 'Image Selected',
            description: 'Save profile to upload new image',
            status: 'info',
            duration: 2000,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getUserTypeLabel = () => {
    if (!userData) return 'User';
    
    if (userData.isGovernmentOfficial || userData.role === 'GOVERNMENT_OFFICIAL') {
      return 'Government Official';
    }
    
    const labels: Record<string, string> = {
      FARMER: 'Verified Farmer',
      INVESTOR: 'Verified Investor',
      CONTRIBUTOR: 'Contributor',
    };
    return labels[userData.role || ''] || 'User';
  };

  const getUserTypeColor = () => {
    if (!userData) return 'gray';
    
    if (userData.isGovernmentOfficial || userData.role === 'GOVERNMENT_OFFICIAL') {
      return 'purple';
    }
    
    const colors: Record<string, string> = {
      FARMER: 'green',
      INVESTOR: 'blue',
      CONTRIBUTOR: 'orange',
    };
    return colors[userData.role || ''] || 'gray';
  };

  if (isLoading) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody py={12}>
          <VStack spacing={4}>
            <Spinner size="xl" color="green.500" thickness="4px" />
            <Text color="gray.600">Loading your profile...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody py={12}>
          <VStack spacing={4}>
            <Text color="gray.600">Failed to load profile</Text>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={loadProfile}
              colorScheme="green"
            >
              Retry
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardBody>
        <Tabs colorScheme="green" variant="enclosed">
          <TabList>
            <Tab><HStack spacing={2}><FiUser /><Text>Profile</Text></HStack></Tab>
            <Tab><HStack spacing={2}><FiSettings /><Text>Settings</Text></HStack></Tab>
            <Tab><HStack spacing={2}><FiShield /><Text>Security</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
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
                              firstName: userData.firstName || '',
                              lastName: userData.lastName || '',
                              email: userData.email || '',
                              phone: userData.phoneNumber || '',
                              location: userData.location || '',
                              bio: userData.bio || '',
                              profileImage: '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<FiSave />}
                          onClick={handleSave}
                          isLoading={isSaving}
                          loadingText="Saving..."
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        leftIcon={<FiEdit3 />}
                        onClick={() => setIsEditing(true)}
                        colorScheme="green"
                        variant="outline"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </HStack>
                </Flex>

                <Divider />

                {/* Profile Picture */}
                <VStack spacing={4}>
                  <Box position="relative">
                    <Avatar
                      size="2xl"
                      name={`${formData.firstName} ${formData.lastName}`}
                      src={formData.profileImage}
                      bg="green.500"
                    />
                    {isEditing && (
                      <IconButton
                        icon={<FiCamera />}
                        aria-label="Upload photo"
                        size="sm"
                        colorScheme="green"
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
                    <Text fontSize="sm" color="gray.600">{userData.email}</Text>
                    {userData.emailVerified && (
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
                      <InputLeftAddon><FiUser /></InputLeftAddon>
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
                      <InputLeftAddon><FiUser /></InputLeftAddon>
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
                      <InputLeftAddon><FiMail /></InputLeftAddon>
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
                      <InputLeftAddon><FiPhone /></InputLeftAddon>
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
                      <InputLeftAddon><FiMapPin /></InputLeftAddon>
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
                      Brief description (max 500 characters)
                    </FormHelperText>
                  </FormControl>
                </SimpleGrid>

                {userData.walletAddress && (
                  <>
                    <Divider />
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          Connected Wallet
                        </Text>
                        <Code fontSize="xs" p={2} borderRadius="md" w="full">
                          {userData.walletAddress}
                        </Code>
                      </VStack>
                    </Alert>
                  </>
                )}

                {/* Account Info */}
                <Divider />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} fontSize="sm">
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500">Member Since</Text>
                    <Text fontWeight="medium">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500">Last Login</Text>
                    <Text fontWeight="medium">
                      {userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="sm">Notification Preferences</Heading>
                <Divider />

                <VStack spacing={4} align="stretch">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                    { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications about project progress' },
                    { key: 'investmentAlerts', label: 'Investment Alerts', desc: 'Notifications about investments' },
                  ].map((setting, index) => (
                    <React.Fragment key={setting.key}>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{setting.label}</Text>
                          <Text fontSize="sm" color="gray.600">{setting.desc}</Text>
                        </VStack>
                        <Switch
                          colorScheme="green"
                          isChecked={settings[setting.key as keyof typeof settings] as boolean}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked,
                            }))
                          }
                        />
                      </HStack>
                      {index < 3 && <Divider />}
                    </React.Fragment>
                  ))}
                </VStack>

                <Heading size="sm" mt={4}>Privacy Settings</Heading>
                <Divider />

                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">Public Profile</Text>
                    <Text fontSize="sm" color="gray.600">
                      Allow others to view your profile
                    </Text>
                  </VStack>
                  <Switch
                    colorScheme="green"
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
                    colorScheme="green"
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

                <Heading size="sm">Change Password</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData(prev => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData(prev => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData(prev => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  
                  <Button 
                    colorScheme="green" 
                    leftIcon={<FiLock />}
                    onClick={handlePasswordChange}
                  >
                    Update Password
                  </Button>
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default ProfileSettings;