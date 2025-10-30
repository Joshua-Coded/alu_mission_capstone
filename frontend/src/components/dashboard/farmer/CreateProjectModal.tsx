"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { CreateProjectDto, projectApi } from "../../../lib/projectApi";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  Button,
  SimpleGrid,
  Text,
  Box,
  Image,
  IconButton,
  useToast,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  Icon,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiX,
  FiFileText,
  FiSend,
  FiImage,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

interface FormErrors {
  [key: string]: string;
}

interface DraftData {
  formData: CreateProjectDto;
  projectImages: File[];
  projectImagePreviews: string[];
  projectDocuments: File[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose,
  onProjectCreated
}) => {
  // ✅ Get farmer's wallet address
  const { address: walletAddress, isConnected } = useAccount();
  
  const [activeStep, setActiveStep] = useState(0);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectImagePreviews, setProjectImagePreviews] = useState<string[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CreateProjectDto>({
    title: '',
    description: '',
    category: '',
    fundingGoal: 0,
    timeline: '',
    location: '',
    images: [],
    documents: [],
    farmerWalletAddress: '', // ✅ ADDED
  });

  const categories = [
    'POULTRY_FARMING',
    'CROP_PRODUCTION', 
    'LIVESTOCK_FARMING',
    'FISH_FARMING',
    'VEGETABLE_FARMING',
    'FRUIT_FARMING',
    'AGRO_PROCESSING',
    'SUSTAINABLE_AGRICULTURE',
    'ORGANIC_FARMING',
    'GENERAL_AGRICULTURE'
  ];

  const locations = [
    'Kigali Province',
    'Eastern Province', 
    'Northern Province',
    'Southern Province',
    'Western Province',
  ];

  // ✅ IMPROVED: Auto-save to localStorage with images and documents
  useEffect(() => {
    if (isOpen && (formData.title || formData.description || projectImages.length > 0)) {
      const draftData: DraftData = {
        formData,
        projectImages: [], // Files can't be stored in localStorage
        projectImagePreviews, // Store previews instead
        projectDocuments: [], // Files can't be stored in localStorage
      };
      
      localStorage.setItem('draft_project', JSON.stringify(draftData));
      localStorage.setItem('draft_project_step', activeStep.toString());
    }
  }, [formData, isOpen, activeStep, projectImagePreviews, projectImages.length]);

  // ✅ IMPROVED: Restore from localStorage with image previews
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('draft_project');
      const savedStep = localStorage.getItem('draft_project_step');
      
      if (savedData) {
        try {
          const parsed: DraftData = JSON.parse(savedData);
          setFormData(parsed.formData);
          setProjectImagePreviews(parsed.projectImagePreviews || []);
          
          toast({
            title: "Draft Restored",
            description: "Your previous work has been restored",
            status: "info",
            duration: 3000,
          });
        } catch (e) {
          console.error('Error restoring form data:', e);
        }
      }
      
      if (savedStep) {
        setActiveStep(parseInt(savedStep));
      }
    }
  }, [isOpen, toast]);

  const validateStep = useCallback((step: number): FormErrors => {
    const errors: FormErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.title?.trim()) errors.title = 'Project title is required';
        if (!formData.description?.trim()) errors.description = 'Description is required';
        if (formData.description && formData.description.length < 50) {
          errors.description = 'Description must be at least 50 characters';
        }
        if (!formData.category) errors.category = 'Category is required';
        break;
        
      case 1:
        if (!formData.location) errors.location = 'Location is required';
        if (!formData.timeline?.trim()) errors.timeline = 'Timeline is required';
        break;
        
      case 2:
        // ✅ CHANGED: 100 → 5 MATIC minimum
        if (!formData.fundingGoal || formData.fundingGoal < 5) {
          errors.fundingGoal = 'Minimum funding goal is 5 MATIC';
        }
        if (formData.fundingGoal > 100000) {
          errors.fundingGoal = 'Maximum funding goal is 100,000 MATIC';
        }
        break;
    }
    
    return errors;
  }, [formData]);
  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 10;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (projectImages.length + files.length > maxFiles) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxFiles} images allowed`,
        status: "error",
        duration: 3000,
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} must be JPEG, PNG, or WEBP`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === validFiles.length) {
            setProjectImagePreviews(prev => [...prev, ...newPreviews]);
            setProjectImages(prev => [...prev, ...validFiles]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear the input to allow uploading same files again
    event.target.value = '';
  }, [projectImages, toast]);

  const handleDocumentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} must be PDF or DOCX`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      validFiles.push(file);
    });

    setProjectDocuments(prev => [...prev, ...validFiles]);
    
    // Clear the input to allow uploading same files again
    event.target.value = '';
  }, [toast]);

  const removeImage = useCallback((index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
    setProjectImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeDocument = useCallback((index: number) => {
    setProjectDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleNext = useCallback(() => {
    const errors = validateStep(activeStep);
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0 && activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else if (Object.keys(errors).length > 0) {
      toast({
        title: "Please fix errors",
        description: "Complete all required fields before continuing",
        status: "error",
        duration: 3000,
      });
    }
  }, [activeStep, validateStep, toast]);

  const handlePrevious = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  const uploadFiles = async (): Promise<{
    imageUrls: string[];
    documentData: Array<{ name: string; url: string }>;
  }> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let imageUrls: string[] = [];
      if (projectImages.length > 0) {
        setUploadProgress(25);
        const imageUploadResult = await projectApi.uploadMultipleImages(projectImages);
        imageUrls = imageUploadResult.urls;
        setUploadProgress(50);
      }

      const documentData: Array<{ name: string; url: string }> = [];
      if (projectDocuments.length > 0) {
        for (let i = 0; i < projectDocuments.length; i++) {
          const doc = projectDocuments[i];
          const result = await projectApi.uploadDocument(doc);
          documentData.push({
            name: result.name || doc.name,
            url: result.url,
          });
          setUploadProgress(50 + (25 * (i + 1)) / projectDocuments.length);
        }
      }

      setUploadProgress(100);
      return { imageUrls, documentData };
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    // ✅ ADDED: Check wallet connection
    if (!isConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet to submit a project",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const errors = validateStep(activeStep);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Please fix errors",
        description: "Complete all required fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { imageUrls, documentData } = await uploadFiles();

      // ✅ ADDED: Include farmer wallet address
      const projectData: CreateProjectDto = {
        ...formData,
        images: imageUrls,
        documents: documentData,
        farmerWalletAddress: walletAddress,
      };
      
      await projectApi.createProject(projectData);
      
      // ✅ ADDED: Clear localStorage after success
      localStorage.removeItem('draft_project');
      localStorage.removeItem('draft_project_step');
      
      toast({
        title: "Project Submitted!",
        description: "Your project has been submitted for government review.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      if (onProjectCreated) {
        onProjectCreated();
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Project submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit project. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      fundingGoal: 0,
      timeline: '',
      location: '',
      images: [],
      documents: [],
      farmerWalletAddress: '',
    });
    setProjectImages([]);
    setProjectImagePreviews([]);
    setProjectDocuments([]);
    setActiveStep(0);
    setFormErrors({});
    
    // Clear localStorage
    localStorage.removeItem('draft_project');
    localStorage.removeItem('draft_project_step');
  };

  // ✅ IMPROVED: Custom close handler with confirmation
  const handleClose = () => {
    const hasData = formData.title || formData.description || projectImages.length > 0 || projectImagePreviews.length > 0;
    
    if (hasData && !isSubmitting) {
      const confirmed = window.confirm(
        'Your progress has been saved as a draft. Close anyway?'
      );
      if (!confirmed) return;
    }
    
    onClose();
  };

  const getStepTitle = () => {
    const titles = [
      'Project Details',
      'Location & Timeline',
      'Funding Goal',
      'Review & Submit'
    ];
    return titles[activeStep];
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.title}>
              <FormLabel fontWeight="semibold">Project Title</FormLabel>
              <Input
                size="lg"
                placeholder="e.g., Modern Cassava Processing Factory"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              <FormErrorMessage>{formErrors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.category}>
              <FormLabel fontWeight="semibold">Category</FormLabel>
              <Select
                size="lg"
                placeholder="Select category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.category}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.description}>
              <FormLabel fontWeight="semibold">Project Description</FormLabel>
              <Textarea
                size="lg"
                placeholder="Describe your project: goals, methods, expected outcomes..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                resize="vertical"
              />
              <FormErrorMessage>{formErrors.description}</FormErrorMessage>
              <FormHelperText>
                Minimum 50 characters ({formData.description.length}/50)
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold">
                <HStack>
                  <Icon as={FiImage} />
                  <Text>Project Images</Text>
                  <Badge colorScheme="gray">{projectImages.length}/10</Badge>
                </HStack>
              </FormLabel>
              <VStack spacing={4} align="stretch">
                <Box
                  border="2px"
                  borderColor={projectImages.length > 0 ? "green.300" : "gray.300"}
                  borderStyle="dashed"
                  borderRadius="lg"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  bg={projectImages.length > 0 ? "green.50" : "gray.50"}
                  _hover={{ borderColor: 'green.400', bg: 'green.50' }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  transition="all 0.2s"
                >
                  <VStack spacing={3}>
                    <Icon as={FiUpload} boxSize={8} color="gray.400" />
                    <Text fontWeight="medium">Click to upload images</Text>
                    <Text fontSize="sm" color="gray.500">
                      PNG, JPG up to 5MB each
                    </Text>
                  </VStack>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </Box>
                
                {projectImagePreviews.length > 0 && (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    {projectImagePreviews.map((preview, index) => (
                      <Box 
                        key={index} 
                        position="relative" 
                        borderRadius="lg" 
                        overflow="hidden"
                        boxShadow="sm"
                        _hover={{ boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          w="full"
                          h="120px"
                          objectFit="cover"
                        />
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                          borderRadius="full"
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.location}>
              <FormLabel fontWeight="semibold">
                <HStack>
                  <Icon as={FiMapPin} />
                  <Text>Farm Location</Text>
                </HStack>
              </FormLabel>
              <Select
                size="lg"
                placeholder="Select province"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.location}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.timeline}>
              <FormLabel fontWeight="semibold">
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>Project Timeline</Text>
                </HStack>
              </FormLabel>
              <Input
                size="lg"
                placeholder="e.g., 6 months, March - September 2025"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              />
              <FormErrorMessage>{formErrors.timeline}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold">
                <HStack>
                  <Icon as={FiFileText} />
                  <Text>Supporting Documents</Text>
                  <Badge colorScheme="gray">{projectDocuments.length}</Badge>
                </HStack>
              </FormLabel>
              <VStack spacing={4} align="stretch">
                <Box
                  border="2px"
                  borderColor={projectDocuments.length > 0 ? "blue.300" : "gray.300"}
                  borderStyle="dashed"
                  borderRadius="lg"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  bg={projectDocuments.length > 0 ? "blue.50" : "gray.50"}
                  _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                  onClick={() => document.getElementById('document-upload')?.click()}
                  transition="all 0.2s"
                >
                  <VStack spacing={3}>
                    <Icon as={FiFileText} boxSize={8} color="gray.400" />
                    <Text fontWeight="medium">Click to upload documents</Text>
                    <Text fontSize="sm" color="gray.500">
                      PDF, DOCX up to 10MB each
                    </Text>
                  </VStack>
                  <input
                    id="document-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleDocumentUpload}
                  />
                </Box>
                
                {projectDocuments.length > 0 && (
                  <VStack align="stretch" spacing={2}>
                    {projectDocuments.map((doc, index) => (
                      <HStack
                        key={index}
                        p={4}
                        bg="blue.50"
                        borderRadius="lg"
                        justify="space-between"
                        border="1px"
                        borderColor="blue.200"
                      >
                        <HStack spacing={3}>
                          <Icon as={FiFileText} color="blue.500" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">{doc.name}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </VStack>
                        </HStack>
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeDocument(index)}
                          aria-label="Remove document"
                        />
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
              <FormHelperText>
                Optional: Land titles, permits, or other supporting documents
              </FormHelperText>
            </FormControl>
          </VStack>
        );

        case 2:
          return (
            <VStack spacing={6} align="stretch">
              <FormControl isRequired isInvalid={!!formErrors.fundingGoal}>
                <FormLabel fontWeight="semibold">
                  <HStack>
                    <Icon as={FiDollarSign} />
                    <Text>Funding Goal (MATIC)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  size="lg"
                  min={5} 
                  max={100000}
                  value={formData.fundingGoal}
                  onChange={(value) => handleInputChange('fundingGoal', parseInt(value) || 0)}
                >
                  <NumberInputField placeholder="10" />
                </NumberInput>
                <FormErrorMessage>{formErrors.fundingGoal}</FormErrorMessage>
                <FormHelperText>
                  Minimum: 5 MATIC | Maximum: 100,000 MATIC
                </FormHelperText>
              </FormControl>
        
              <Alert status="info" borderRadius="lg" variant="left-accent">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Consider costs for seeds, equipment, labor, irrigation, fertilizers, 
                  and a contingency buffer (10-15% of total).
                </AlertDescription>
              </Alert>
            </VStack>
          );
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.fundingGoal}>
              <FormLabel fontWeight="semibold">
                <HStack>
                  <Icon as={FiDollarSign} />
                  <Text>Funding Goal (MATIC)</Text> {/* ✅ CHANGED: USD to MATIC */}
                </HStack>
              </FormLabel>
              <NumberInput
                size="lg"
                min={100} 
                max={100000} 
                value={formData.fundingGoal}
                onChange={(value) => handleInputChange('fundingGoal', parseInt(value) || 0)}
              >
                <NumberInputField placeholder="1000" />
              </NumberInput>
              <FormErrorMessage>{formErrors.fundingGoal}</FormErrorMessage>
              <FormHelperText>
                {/* ✅ CHANGED: USD to MATIC */}
                Range: 100 - 100,000 MATIC
              </FormHelperText>
            </FormControl>

            <Alert status="info" borderRadius="lg" variant="left-accent">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Consider costs for seeds, equipment, labor, irrigation, fertilizers, 
                and a contingency buffer (10-15% of total).
              </AlertDescription>
            </Alert>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            {/* ✅ ADDED: Wallet Status */}
            <Alert 
              status={isConnected ? "success" : "warning"} 
              borderRadius="lg" 
              variant="left-accent"
            >
              <AlertIcon />
              <Box flex="1">
                <AlertDescription fontSize="sm">
                  {isConnected ? (
                    <>
                      <Text fontWeight="bold">✅ Wallet Connected</Text>
                      <Text fontSize="xs" fontFamily="mono" mt={1}>
                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </Text>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        This wallet will receive funds when your project is completed
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text fontWeight="bold">⚠️ Wallet Not Connected</Text>
                      <Text fontSize="xs" mt={1}>
                        Please connect your MetaMask wallet before submitting
                      </Text>
                    </>
                  )}
                </AlertDescription>
              </Box>
            </Alert>

            {/* Project Summary */}
            <Box p={6} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold">📋 Project Summary</Text>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Title:</Text>
                  <Text>{formData.title}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Category:</Text>
                  <Badge colorScheme="green">
                    {formData.category.replace(/_/g, ' ')}
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Location:</Text>
                  <Text>{formData.location}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Timeline:</Text>
                  <Text>{formData.timeline}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Funding Goal:</Text>
                  {/* ✅ CHANGED: USD to MATIC */}
                  <Text fontWeight="bold" fontSize="lg" color="green.600">
                    {formData.fundingGoal.toLocaleString()} MATIC
                  </Text>
                </HStack>
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Images:</Text>
                  <Badge>{projectImages.length} uploaded</Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Documents:</Text>
                  <Badge>{projectDocuments.length} uploaded</Badge>
                </HStack>
              </VStack>
            </Box>

            <Alert status="info" borderRadius="lg" variant="left-accent">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Your project will be reviewed by the government before being published. 
                This typically takes 2-5 business days.
              </AlertDescription>
            </Alert>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} // ✅ CHANGED: Use custom close handler
      size="4xl"
      closeOnOverlayClick={false} // ✅ ADDED: Prevent accidental closes
      closeOnEsc={false} // ✅ ADDED: Prevent ESC key closing
    >
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text>Create New Project</Text>
              <ModalCloseButton position="relative" top={0} right={0} />
            </HStack>
            
            {/* Progress Steps */}
            <HStack spacing={2}>
              {[0, 1, 2, 3].map((step) => (
                <Box
                  key={step}
                  flex={1}
                  h="2"
                  bg={activeStep >= step ? 'green.500' : 'gray.200'}
                  borderRadius="full"
                  transition="all 0.3s"
                />
              ))}
            </HStack>
            
            <Text fontSize="md" color="gray.600" fontWeight="normal">
              Step {activeStep + 1} of 4: {getStepTitle()}
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Upload Progress */}
            {isUploading && (
              <Box>
                <Text fontSize="sm" mb={2}>Uploading files...</Text>
                <Progress value={uploadProgress} colorScheme="green" size="sm" />
              </Box>
            )}

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <HStack justify="space-between" pt={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={handlePrevious}
                isDisabled={activeStep === 0 || isSubmitting}
                variant="ghost"
              >
                Previous
              </Button>

              {activeStep < 3 ? (
                <Button
                  rightIcon={<FiArrowRight />}
                  onClick={handleNext}
                  colorScheme="green"
                  isDisabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  rightIcon={<FiSend />}
                  onClick={handleSubmit}
                  colorScheme="green"
                  isLoading={isSubmitting || isUploading}
                  loadingText="Submitting..."
                  isDisabled={!isConnected}
                >
                  Submit Project
                </Button>
              )}
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;