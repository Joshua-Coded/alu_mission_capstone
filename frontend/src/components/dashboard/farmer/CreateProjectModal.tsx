import React, { useCallback, useState } from "react";
import { CreateProjectDto, projectApi } from "../../../lib/projectApi";

// components/dashboard/farmer/CreateProjectModal.tsx

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
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
  AlertTitle,
  AlertDescription,
  Progress,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiX,
  FiCheck,
  FiInfo,
  FiFileText,
} from 'react-icons/fi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { title: 'Basic Info', description: 'Project details' },
  { title: 'Location & Timeline', description: 'Farm details' },
  { title: 'Funding', description: 'Financial planning' },
  { title: 'Review', description: 'Submit project' }
];

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose,
  onProjectCreated
}) => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectImagePreviews, setProjectImagePreviews] = useState<string[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form state matching CreateProjectDto
  const [formData, setFormData] = useState<CreateProjectDto>({
    title: '',
    description: '',
    category: '',
    fundingGoal: 0,
    timeline: '',
    location: '',
    images: [],
    documents: [],
  });

  const categories = [
    'Crops',
    'Livestock',
    'Equipment',
    'Infrastructure',
    'Processing',
    'Storage',
    'Irrigation',
    'Seeds & Fertilizer',
  ];

  const locations = [
    'Kigali Province',
    'Eastern Province', 
    'Northern Province',
    'Southern Province',
    'Western Province',
  ];

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
        if (!formData.fundingGoal || formData.fundingGoal < 1000) {
          errors.fundingGoal = 'Minimum funding goal is $1,000';
        }
        if (formData.fundingGoal > 1000000) {
          errors.fundingGoal = 'Maximum funding goal is $1,000,000';
        }
        break;
    }
    
    return errors;
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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

  const maxSize = 5 * 1024 * 1024; // 5MB
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
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        newPreviews.push(e.target.result as string);
        if (newPreviews.length === validFiles.length) {
          setProjectImagePreviews(prev => [...prev, ...newPreviews]);
        }
      }
    };
    reader.readAsDataURL(file);
  });

  setProjectImages(prev => [...prev, ...validFiles]);
}, [projectImages, toast]);

const handleDocumentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  const maxSize = 10 * 1024 * 1024; // 10MB
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
    
    if (Object.keys(errors).length === 0 && activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else if (Object.keys(errors).length > 0) {
      toast({
        title: "Please fix errors",
        description: "Please correct the highlighted fields before proceeding",
        status: "error",
        duration: 3000,
      });
    }
  }, [activeStep, validateStep, toast, setActiveStep]);

  const handlePrevious = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep, setActiveStep]);

  const uploadFiles = async (): Promise<{
    imageUrls: string[];
    documentData: Array<{ name: string; url: string }>;
  }> => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload images
      let imageUrls: string[] = [];
      if (projectImages.length > 0) {
        setUploadProgress(25);
        const imageUploadResult = await projectApi.uploadMultipleImages(projectImages);
        imageUrls = imageUploadResult.urls;
        setUploadProgress(50);
      }

      // Upload documents
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
    const errors = validateStep(activeStep);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Please fix errors",
        description: "Please correct all errors before submitting",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload files first
      const { imageUrls, documentData } = await uploadFiles();

      // Create project with uploaded file URLs
      const projectData: CreateProjectDto = {
        ...formData,
        images: imageUrls,
        documents: documentData,
      };

      const createdProject = await projectApi.createProject(projectData);
      
      toast({
        title: "Project Created Successfully!",
        description: "Your project has been created as a draft. Submit it for government verification when ready.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Call callback to refresh project list
      if (onProjectCreated) {
        onProjectCreated();
      }
      
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error creating your project. Please try again.",
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
    });
    setProjectImages([]);
    setProjectImagePreviews([]);
    setProjectDocuments([]);
    setActiveStep(0);
    setFormErrors({});
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.title}>
              <FormLabel>Project Title</FormLabel>
              <Input
                placeholder="e.g., Organic Tomato Farming 2025"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              <FormErrorMessage>{formErrors.title}</FormErrorMessage>
              <FormHelperText>Choose a clear, descriptive name</FormHelperText>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.description}>
              <FormLabel>Project Description</FormLabel>
              <Textarea
                placeholder="Describe your project in detail: what you're growing, your methods, expected outcomes, and what makes your project unique..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                resize="vertical"
              />
              <FormErrorMessage>{formErrors.description}</FormErrorMessage>
              <FormHelperText>
                Minimum 50 characters. Be detailed to attract investors.
              </FormHelperText>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.category}>
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select project category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.category}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Project Images</FormLabel>
              <VStack spacing={4} align="stretch">
                <Box
                  border="2px"
                  borderColor={projectImages.length > 0 ? "green.300" : "gray.300"}
                  borderStyle="dashed"
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: 'brand.400', bg: 'gray.50' }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <FiUpload size={24} />
                    <Text>Click to upload images</Text>
                    <Text fontSize="sm" color="gray.500">
                      PNG, JPG up to 5MB • {projectImages.length}/10 images
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
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    {projectImagePreviews.map((preview, index) => (
                      <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          w="full"
                          h="100px"
                          objectFit="cover"
                        />
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top={1}
                          right={1}
                          onClick={() => removeImage(index)}
                          aria-label="Remove image"
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
              <FormHelperText>
                Add photos to make your project more attractive
              </FormHelperText>
            </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.location}>
              <FormLabel>Farm Location</FormLabel>
              <Select
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
              <FormLabel>Project Timeline</FormLabel>
              <Input
                placeholder="e.g., 6 months, 1 year, March - September 2025"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              />
              <FormErrorMessage>{formErrors.timeline}</FormErrorMessage>
              <FormHelperText>
                Specify the expected duration or harvest date
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Supporting Documents</FormLabel>
              <VStack spacing={4} align="stretch">
                <Box
                  border="2px"
                  borderColor={projectDocuments.length > 0 ? "blue.300" : "gray.300"}
                  borderStyle="dashed"
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: 'blue.400', bg: 'gray.50' }}
                  onClick={() => document.getElementById('document-upload')?.click()}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <FiFileText size={24} />
                    <Text>Click to upload documents</Text>
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
                        p={3}
                        bg="blue.50"
                        borderRadius="md"
                        justify="space-between"
                      >
                        <HStack>
                          <FiFileText />
                          <Text fontSize="sm" fontWeight="medium">{doc.name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                          </Text>
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
                Land titles, permits, or other supporting documents (optional)
              </FormHelperText>
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.fundingGoal}>
              <FormLabel>Funding Goal ($)</FormLabel>
              <NumberInput
                min={1000}
                max={1000000}
                value={formData.fundingGoal}
                onChange={(value) => handleInputChange('fundingGoal', parseInt(value) || 0)}
              >
                <NumberInputField placeholder="10000" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formErrors.fundingGoal}</FormErrorMessage>
              <FormHelperText>
                Minimum: $1,000 | Maximum: $1,000,000
              </FormHelperText>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Funding Breakdown</AlertTitle>
                <AlertDescription>
                  Consider including costs for: seeds, equipment, labor, irrigation, 
                  fertilizers, and a contingency buffer (10-15% of total).
                </AlertDescription>
              </Box>
            </Alert>

            <Box p={4} bg="blue.50" borderRadius="md">
              <HStack spacing={3}>
                <FiInfo size={20} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Next Steps</Text>
                  <Text fontSize="sm">
                    After creating your project, it will be saved as a draft. 
                    You can then submit it for government verification.
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Ready to Create</AlertTitle>
                <AlertDescription>
                  Review your project details below. After creation, you can submit 
                  it for government verification to make it visible to investors.
                </AlertDescription>
              </Box>
            </Alert>

            <Box p={6} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
              <Text fontSize="lg" fontWeight="bold" mb={4}>
                Project Summary
              </Text>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Title</Text>
                    <Text fontWeight="medium">{formData.title || 'Not specified'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Category</Text>
                    <Badge colorScheme="green">{formData.category || 'Not specified'}</Badge>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Location</Text>
                    <Text fontWeight="medium">{formData.location || 'Not specified'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Timeline</Text>
                    <Text fontWeight="medium">{formData.timeline || 'Not specified'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600">Funding Goal</Text>
                    <Text fontWeight="bold" color="green.600" fontSize="lg">
                      ${formData.fundingGoal.toLocaleString()}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600">Status</Text>
                    <Badge colorScheme="yellow">Draft</Badge>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>Description</Text>
                  <Text fontSize="sm" p={3} bg="white" borderRadius="md">
                    {formData.description || 'Not specified'}
                  </Text>
                </Box>

                <HStack spacing={6}>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">IMAGES</Text>
                    <Text fontWeight="bold">{projectImages.length}</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">DOCUMENTS</Text>
                    <Text fontWeight="bold">{projectDocuments.length}</Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    const errors = validateStep(activeStep);
    return Object.keys(errors).length === 0;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
      <ModalContent maxH="95vh" overflowY="auto" mx={4}>
        <ModalHeader>
          <VStack align="start" spacing={4}>
            <HStack spacing={4} justify="space-between" w="full">
              <Text fontSize="2xl" fontWeight="bold">
                Create New Project
              </Text>
              <Text fontSize="sm" color="gray.500">
                Step {activeStep + 1} of {steps.length}
              </Text>
            </HStack>
            
            <Box w="full">
              <Progress 
                value={((activeStep + 1) / steps.length) * 100} 
                colorScheme="brand" 
                size="sm" 
                borderRadius="full" 
                mb={4} 
              />
              
              <Stepper index={activeStep} w="full" size="sm">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle fontSize="sm">{step.title}</StepTitle>
                      <StepDescription fontSize="xs">{step.description}</StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={8} align="stretch">
            <Box minH="400px">
              {renderStepContent()}
            </Box>

            {isUploading && (
              <Box>
                <HStack spacing={3} mb={3}>
                  <Text fontSize="sm" color="gray.600">
                    Uploading files...
                  </Text>
                </HStack>
                <Progress value={uploadProgress} colorScheme="blue" size="sm" borderRadius="full" />
              </Box>
            )}

            <Divider />

            <HStack justify="space-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                isDisabled={activeStep === 0}
              >
                Previous
              </Button>

              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    colorScheme="brand"
                    onClick={handleNext}
                    isDisabled={!isStepValid()}
                    rightIcon={<FiCheck />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Tooltip 
                    label={!isStepValid() ? "Please complete all required fields" : ""} 
                    isDisabled={isStepValid()}
                  >
                    <Button
                      colorScheme="green"
                      leftIcon={<FiCheck />}
                      onClick={handleSubmit}
                      isLoading={isSubmitting || isUploading}
                      loadingText={isUploading ? "Uploading..." : "Creating..."}
                      isDisabled={!isStepValid()}
                      size="lg"
                    >
                      Create Project
                    </Button>
                  </Tooltip>
                )}
              </HStack>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;