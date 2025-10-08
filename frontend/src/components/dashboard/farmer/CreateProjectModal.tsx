import React, { useCallback, useState } from "react";

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
  Switch,
  Checkbox,
  CheckboxGroup,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiX,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiCheck,
  FiClock,
  FiInfo,
  FiAlertTriangle,
  FiLayers,
  FiDroplet,
  FiSun,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiFileText,
} from 'react-icons/fi';

// Import types from your definitions - adjust path as needed
import type { 
  Project,
  FarmingMethod,
  IrrigationType,
} from '../../../types/farmer';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (projectData: Partial<Project>) => Promise<void>;
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { title: 'Basic Info', description: 'Project details & description' },
  { title: 'Farm Details', description: 'Location, size & methods' },
  { title: 'Financial', description: 'Funding & ROI planning' },
  { title: 'Advanced', description: 'Risk, sustainability & team' },
  { title: 'Review', description: 'Submit for verification' }
];

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [targetMarkets, setTargetMarkets] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  // Enhanced form state based on Project interface
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    cropType: '',
    farmingMethod: undefined,
    location: '',
    farmSize: 0,
    expectedYield: 0,
    startDate: new Date(),
    expectedEndDate: new Date(),
    irrigationType: undefined,
    seedVariety: '',
    soilType: '',
    fundingGoal: 0,
    expectedROI: 0,
    pricePerKg: 0,
    riskLevel: undefined,
    riskFactors: [],
    sustainabilityScore: 0,
    organicCertified: false,
    targetMarket: [],
    teamSize: 1,
    cooperativeSupport: false,
    status: 'funding',
    phase: 'Planning',
    images: [],
    documents: [],
    milestones: [],
    updates: [],
    currentFunding: 0,
    progress: 0,
    investors: 0,
    id: '',
    farmerAddress: '',
  });

  const cropTypes = [
    'Tomatoes', 'Heirloom Tomatoes', 'Cherry Tomatoes',
    'Corn', 'Sweet Corn', 'Maize',
    'Lettuce', 'Spinach', 'Kale',
    'Potatoes', 'Sweet Potatoes',
    'Beans', 'Green Beans', 'Soybeans',
    'Cabbage', 'Broccoli', 'Cauliflower',
    'Carrots', 'Beets', 'Radishes',
    'Peppers', 'Bell Peppers', 'Hot Peppers',
    'Onions', 'Garlic', 'Leeks',
    'Rice', 'Coffee', 'Tea',
    'Bananas', 'Avocados', 'Mangoes'
  ];

  const farmingMethods: FarmingMethod[] = [
    'Organic',
    'Conventional', 
    'Hydroponic',
    'Vertical',
    'Greenhouse',
    'Permaculture'
  ];

  const irrigationTypes: IrrigationType[] = [
    'Drip',
    'Sprinkler',
    'Flood',
    'Rain-fed'
  ];

  const locations = [
    'Kigali Province',
    'Eastern Province', 
    'Northern Province',
    'Southern Province',
    'Western Province',
  ];

  const soilTypes = [
    'Clay', 'Sandy', 'Loam', 'Sandy Loam', 
    'Clay Loam', 'Silt', 'Silt Loam', 'Peaty'
  ];

  const riskLevels = ['Low', 'Medium', 'High'] as const;

  const commonRiskFactors = [
    'Weather dependency',
    'Market price fluctuation',
    'Pest and disease risk',
    'Seasonal variations',
    'Water availability',
    'Equipment failure',
    'Labor shortage',
    'Climate change impacts'
  ];

  const marketChannels = [
    'Local restaurants',
    'Farmers markets',
    'Supermarkets',
    'Export markets',
    'Food processors',
    'Schools/institutions',
    'Direct to consumer',
    'Cooperative sales'
  ];

  const certificationTypes = [
    'Organic Certification',
    'Fair Trade',
    'Rainforest Alliance',
    'Global GAP',
    'ISO 14001',
    'HACCP',
    'Non-GMO Project'
  ];

  const validateStep = useCallback((step: number): FormErrors => {
    const errors: FormErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.name?.trim()) errors.name = 'Project name is required';
        if (!formData.description?.trim()) errors.description = 'Description is required';
        if (!formData.cropType) errors.cropType = 'Crop type is required';
        if (!formData.farmingMethod) errors.farmingMethod = 'Farming method is required';
        break;
        
      case 1:
        if (!formData.location) errors.location = 'Location is required';
        if (!formData.farmSize || formData.farmSize <= 0) errors.farmSize = 'Valid farm size is required';
        if (!formData.expectedYield || formData.expectedYield <= 0) errors.expectedYield = 'Valid expected yield is required';
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.expectedEndDate) errors.expectedEndDate = 'Expected end date is required';
        if (formData.startDate && formData.expectedEndDate && formData.startDate >= formData.expectedEndDate) {
          errors.expectedEndDate = 'End date must be after start date';
        }
        break;
        
      case 2:
        if (!formData.fundingGoal || formData.fundingGoal < 1000) errors.fundingGoal = 'Minimum funding goal is $1,000';
        if (!formData.expectedROI || formData.expectedROI <= 0) errors.expectedROI = 'Expected ROI must be greater than 0%';
        if (formData.expectedROI && formData.expectedROI > 100) errors.expectedROI = 'Expected ROI seems unrealistic (>100%)';
        break;
        
      case 3:
        if (!formData.riskLevel) errors.riskLevel = 'Risk level assessment is required';
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
    if (files) {
      const maxSize = 5 * 1024 * 1024;
      const validFiles = Array.from(files).filter(file => {
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            status: "error",
            duration: 3000,
          });
          return false;
        }
        return true;
      });

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setProjectImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, [toast]);

  const removeImage = useCallback((index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addMarket = useCallback((market: string) => {
    if (market && !targetMarkets.includes(market)) {
      const newMarkets = [...targetMarkets, market];
      setTargetMarkets(newMarkets);
      handleInputChange('targetMarket', newMarkets);
    }
  }, [targetMarkets, handleInputChange]);

  const removeMarket = useCallback((market: string) => {
    const newMarkets = targetMarkets.filter(m => m !== market);
    setTargetMarkets(newMarkets);
    handleInputChange('targetMarket', newMarkets);
  }, [targetMarkets, handleInputChange]);

  const addRiskFactor = useCallback((factor: string) => {
    if (factor && !riskFactors.includes(factor)) {
      const newFactors = [...riskFactors, factor];
      setRiskFactors(newFactors);
      handleInputChange('riskFactors', newFactors);
    }
  }, [riskFactors, handleInputChange]);

  const removeRiskFactor = useCallback((factor: string) => {
    const newFactors = riskFactors.filter(f => f !== factor);
    setRiskFactors(newFactors);
    handleInputChange('riskFactors', newFactors);
  }, [riskFactors, handleInputChange]);

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
      const projectData: Partial<Project> = {
        ...formData,
        images: projectImages,
        targetMarket: targetMarkets,
        riskFactors: riskFactors,
        currentFunding: 0,
        progress: 0,
        investors: 0,
        updates: [],
        id: `project_${Date.now()}`,
      };

      if (onSubmit) {
        await onSubmit(projectData);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      toast({
        title: "Project Submitted Successfully!",
        description: "Your project has been submitted for government verification. You'll receive updates within 3-5 business days.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        cropType: '',
        farmingMethod: undefined,
        location: '',
        farmSize: 0,
        expectedYield: 0,
        startDate: new Date(),
        expectedEndDate: new Date(),
        fundingGoal: 0,
        expectedROI: 0,
        status: 'funding',
        phase: 'Planning',
        images: [],
        documents: [],
        milestones: [],
        updates: [],
        currentFunding: 0,
        progress: 0,
        investors: 0,
        id: '',
        farmerAddress: '',
      });
      setProjectImages([]);
      setTargetMarkets([]);
      setRiskFactors([]);
      setCertifications([]);
      setActiveStep(0);
      setFormErrors({});
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your project. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.name}>
              <FormLabel>Project Name</FormLabel>
              <Input
                placeholder="e.g., Organic Heritage Tomatoes 2025"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              <FormHelperText>Choose a descriptive name for your farming project</FormHelperText>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.description}>
              <FormLabel>Project Description</FormLabel>
              <Textarea
                placeholder="Describe your farming project, methods, goals, and what makes it unique..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                resize="vertical"
              />
              <FormErrorMessage>{formErrors.description}</FormErrorMessage>
              <FormHelperText>
                Provide details about your farming approach, sustainability practices, and expected outcomes
              </FormHelperText>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!formErrors.cropType}>
                <FormLabel>Crop Type</FormLabel>
                <Select
                  placeholder="Select crop type"
                  value={formData.cropType || ''}
                  onChange={(e) => handleInputChange('cropType', e.target.value)}
                >
                  {cropTypes.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </Select>
                <FormErrorMessage>{formErrors.cropType}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.farmingMethod}>
                <FormLabel>Farming Method</FormLabel>
                <Select
                  placeholder="Select farming method"
                  value={formData.farmingMethod || ''}
                  onChange={(e) => handleInputChange('farmingMethod', e.target.value as FarmingMethod)}
                >
                  {farmingMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </Select>
                <FormErrorMessage>{formErrors.farmingMethod}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

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
                  onClick={() => document.getElementById('file-upload')?.click()}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <FiUpload size={24} />
                    <Text>Click to upload project images</Text>
                    <Text fontSize="sm" color="gray.500">
                      PNG, JPG up to 5MB each • {projectImages.length}/10 images
                    </Text>
                  </VStack>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </Box>
                
                {projectImages.length > 0 && (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    {projectImages.map((image, index) => (
                      <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                        <Image
                          src={image}
                          alt={`Project image ${index + 1}`}
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
                Add photos of your farm, crops, or equipment to make your project more attractive to investors
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
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.location}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!formErrors.farmSize}>
                <FormLabel>Farm Size (acres)</FormLabel>
                <NumberInput
                  min={0.1}
                  step={0.1}
                  precision={1}
                  value={formData.farmSize || 0}
                  onChange={(value) => handleInputChange('farmSize', parseFloat(value) || 0)}
                >
                  <NumberInputField placeholder="2.5" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{formErrors.farmSize}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.expectedYield}>
                <FormLabel>Expected Yield (kg)</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.expectedYield || 0}
                  onChange={(value) => handleInputChange('expectedYield', parseInt(value) || 0)}
                >
                  <NumberInputField placeholder="8000" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{formErrors.expectedYield}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!formErrors.startDate}>
                <FormLabel>Project Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                />
                <FormErrorMessage>{formErrors.startDate}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.expectedEndDate}>
                <FormLabel>Expected Harvest Date</FormLabel>
                <Input
                  type="date"
                  value={formData.expectedEndDate ? formData.expectedEndDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('expectedEndDate', new Date(e.target.value))}
                />
                <FormErrorMessage>{formErrors.expectedEndDate}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="medium">Additional Farm Details</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel>Irrigation Type</FormLabel>
                      <Select
                        placeholder="Select irrigation method"
                        value={formData.irrigationType || ''}
                        onChange={(e) => handleInputChange('irrigationType', e.target.value as IrrigationType)}
                      >
                        {irrigationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Soil Type</FormLabel>
                      <Select
                        placeholder="Select soil type"
                        value={formData.soilType || ''}
                        onChange={(e) => handleInputChange('soilType', e.target.value)}
                      >
                        {soilTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Seed Variety</FormLabel>
                      <Input
                        placeholder="e.g., Cherokee Purple, Brandywine"
                        value={formData.seedVariety || ''}
                        onChange={(e) => handleInputChange('seedVariety', e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Team Size</FormLabel>
                      <NumberInput
                        min={1}
                        value={formData.teamSize || 1}
                        onChange={(value) => handleInputChange('teamSize', parseInt(value) || 1)}
                      >
                        <NumberInputField placeholder="4" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!formErrors.fundingGoal}>
                <FormLabel>Funding Goal ($)</FormLabel>
                <NumberInput
                  min={1000}
                  value={formData.fundingGoal || 0}
                  onChange={(value) => handleInputChange('fundingGoal', parseInt(value) || 0)}
                >
                  <NumberInputField placeholder="15000" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{formErrors.fundingGoal}</FormErrorMessage>
                <FormHelperText>Minimum funding goal is $1,000</FormHelperText>
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.expectedROI}>
                <FormLabel>Expected ROI (%)</FormLabel>
                <NumberInput
                  min={1}
                  max={100}
                  value={formData.expectedROI || 0}
                  onChange={(value) => handleInputChange('expectedROI', parseInt(value) || 0)}
                >
                  <NumberInputField placeholder="25" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{formErrors.expectedROI}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Expected Price per Kg ($)</FormLabel>
              <NumberInput
                min={0.1}
                step={0.1}
                precision={2}
                value={formData.pricePerKg || 0}
                onChange={(value) => handleInputChange('pricePerKg', parseFloat(value) || 0)}
              >
                <NumberInputField placeholder="4.50" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>Current market price for your crop type</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Target Markets</FormLabel>
              <VStack align="stretch" spacing={3}>
                <Select
                  placeholder="Add target market"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addMarket(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  {marketChannels.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </Select>
                
                {targetMarkets.length > 0 && (
                  <Wrap>
                    {targetMarkets.map((market, index) => (
                      <WrapItem key={index}>
                        <Tag size="md" colorScheme="blue" borderRadius="full">
                          <TagLabel>{market}</TagLabel>
                          <TagCloseButton onClick={() => removeMarket(market)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
              <FormHelperText>Select where you plan to sell your produce</FormHelperText>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Funding Breakdown</AlertTitle>
                <AlertDescription>
                  Consider including costs for seeds, equipment, labor, irrigation, fertilizers, 
                  and a contingency buffer (10-15% of total).
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.riskLevel}>
              <FormLabel>Risk Level Assessment</FormLabel>
              <Select
                placeholder="Select risk level"
                value={formData.riskLevel || ''}
                onChange={(e) => handleInputChange('riskLevel', e.target.value)}
              >
                {riskLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
              <FormErrorMessage>{formErrors.riskLevel}</FormErrorMessage>
              <FormHelperText>Honest risk assessment helps build investor trust</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Risk Factors</FormLabel>
              <VStack align="stretch" spacing={3}>
                <Select
                  placeholder="Add risk factor"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addRiskFactor(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  {commonRiskFactors.map(factor => (
                    <option key={factor} value={factor}>{factor}</option>
                  ))}
                </Select>
                
                {riskFactors.length > 0 && (
                  <Wrap>
                    {riskFactors.map((factor, index) => (
                      <WrapItem key={index}>
                        <Tag size="md" colorScheme="orange" borderRadius="full">
                          <TagLabel>{factor}</TagLabel>
                          <TagCloseButton onClick={() => removeRiskFactor(factor)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
              <FormHelperText>Identify potential challenges that could affect your project</FormHelperText>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Sustainability Score (1-10)</FormLabel>
                <NumberInput
                  min={1}
                  max={10}
                  value={formData.sustainabilityScore || 5}
                  onChange={(value) => handleInputChange('sustainabilityScore', parseInt(value) || 5)}
                >
                  <NumberInputField placeholder="8" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Rate your project's environmental sustainability</FormHelperText>
              </FormControl>

              <FormControl>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <FormLabel mb={0}>Organic Certified</FormLabel>
                    <Text fontSize="sm" color="gray.600">
                      Do you have organic certification?
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="green"
                    isChecked={formData.organicCertified || false}
                    onChange={(e) => handleInputChange('organicCertified', e.target.checked)}
                  />
                </HStack>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <FormLabel mb={0}>Cooperative Support</FormLabel>
                  <Text fontSize="sm" color="gray.600">
                    Are you part of a farming cooperative?
                  </Text>
                </VStack>
                <Switch
                  size="lg"
                  colorScheme="blue"
                  isChecked={formData.cooperativeSupport || false}
                  onChange={(e) => handleInputChange('cooperativeSupport', e.target.checked)}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Certifications</FormLabel>
              <CheckboxGroup 
                value={certifications} 
                onChange={(values) => {
                  setCertifications(values as string[]);
                }}
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {certificationTypes.map(cert => (
                    <Checkbox key={cert} value={cert} colorScheme="green">
                      {cert}
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
              <FormHelperText>Select any certifications you have or are pursuing</FormHelperText>
            </FormControl>
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={6} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Government Verification Process</AlertTitle>
                <AlertDescription>
                  Your project will be submitted to government officials for verification. 
                  This typically takes 3-5 business days and includes validation of your 
                  farming credentials and project feasibility.
                </AlertDescription>
              </Box>
            </Alert>

            <Box p={6} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
              <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
                Project Summary
              </Text>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Project Name</Text>
                    <Text fontWeight="medium" fontSize="lg">{formData.name || 'Not specified'}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Crop Type</Text>
                    <HStack>
                      <FiLayers color="green" />
                      <Text fontWeight="medium">{formData.cropType || 'Not specified'}</Text>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Location</Text>
                    <HStack>
                      <FiMapPin color="blue" />
                      <Text fontWeight="medium">{formData.location || 'Not specified'}</Text>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Farm Size</Text>
                    <Text fontWeight="medium">{formData.farmSize} acres</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Funding Goal</Text>
                    <HStack>
                      <FiDollarSign color="green" />
                      <Text fontWeight="bold" color="green.600" fontSize="lg">
                        ${formData.fundingGoal?.toLocaleString()}
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Expected ROI</Text>
                    <HStack>
                      <FiTrendingUp color="purple" />
                      <Text fontWeight="bold" color="purple.600" fontSize="lg">
                        {formData.expectedROI}%
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Farming Method</Text>
                    <Badge colorScheme="green" px={2} py={1}>
                      {formData.farmingMethod}
                    </Badge>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Risk Level</Text>
                    <Badge 
                      colorScheme={
                        formData.riskLevel === 'Low' ? 'green' : 
                        formData.riskLevel === 'Medium' ? 'yellow' : 'red'
                      } 
                      px={2} py={1}
                    >
                      {formData.riskLevel}
                    </Badge>
                  </Box>
                </SimpleGrid>

                {formData.description && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>Project Description</Text>
                    <Text fontSize="sm" p={3} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                      {formData.description}
                    </Text>
                  </Box>
                )}

                {targetMarkets.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>Target Markets</Text>
                    <Wrap>
                      {targetMarkets.map((market, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="blue">{market}</Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {riskFactors.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>Risk Factors</Text>
                    <Wrap>
                      {riskFactors.map((factor, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="orange">{factor}</Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                <HStack spacing={4} pt={2}>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">IMAGES</Text>
                    <Text fontWeight="bold">{projectImages.length}</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">DURATION</Text>
                    <Text fontWeight="bold">
                      {formData.startDate && formData.expectedEndDate 
                        ? `${Math.ceil((formData.expectedEndDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                        : 'N/A'
                      }
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">YIELD</Text>
                    <Text fontWeight="bold">{formData.expectedYield?.toLocaleString()} kg</Text>
                  </VStack>
                  {formData.sustainabilityScore && formData.sustainabilityScore > 0 && (
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.500">SUSTAINABILITY</Text>
                      <Text fontWeight="bold" color="green.600">{formData.sustainabilityScore}/10</Text>
                    </VStack>
                  )}
                </HStack>
              </VStack>
            </Box>

            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Before You Submit</AlertTitle>
                <AlertDescription>
                  <VStack align="start" spacing={1} mt={2}>
                    <Text>• Ensure all information is accurate and complete</Text>
                    <Text>• Government officials will verify your farming credentials</Text>
                    <Text>• You cannot edit the project once submitted for review</Text>
                    <Text>• You'll receive email updates on verification status</Text>
                    <Text>• Approved projects will be visible to investors immediately</Text>
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>

            <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
              <HStack spacing={3}>
                <Box color="blue.500">
                  <FiInfo size={20} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color="blue.800">What happens next?</Text>
                  <Text fontSize="sm" color="blue.700">
                    After submission, you'll receive a confirmation email. Government officials will review 
                    your project within 3-5 business days. Once approved, your project will be live and 
                    investors can start funding it.
                  </Text>
                </VStack>
              </HStack>
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

  const getStepProgress = () => {
    return ((activeStep + 1) / steps.length) * 100;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false}>
      <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
      <ModalContent maxH="95vh" overflowY="auto" mx={4}>
        <ModalHeader>
          <VStack align="start" spacing={4}>
            <HStack spacing={4} justify="space-between" w="full">
              <HStack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  Create New Project
                </Text>
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                  Requires Government Verification
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Step {activeStep + 1} of {steps.length}
              </Text>
            </HStack>
            
            <Box w="full">
              <Progress value={getStepProgress()} colorScheme="brand" size="sm" borderRadius="full" mb={4} />
              
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
            <Box minH="500px">
              {renderStepContent()}
            </Box>

            <Divider />

            <HStack justify="space-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                isDisabled={activeStep === 0}
                leftIcon={<FiClock />}
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
                      isLoading={isSubmitting}
                      loadingText="Submitting for Review..."
                      isDisabled={!isStepValid()}
                      size="lg"
                    >
                      Submit for Government Approval
                    </Button>
                  </Tooltip>
                )}
              </HStack>
            </HStack>

            {isSubmitting && (
              <Box>
                <HStack spacing={3} mb={3}>
                  <Box color="blue.500">
                    <FiShield size={20} />
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    Submitting your project for government verification and investor review...
                  </Text>
                </HStack>
                <Progress isIndeterminate colorScheme="blue" size="sm" borderRadius="full" />
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;