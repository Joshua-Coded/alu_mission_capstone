import React, { useEffect, useState } from "react";
import { FiSave, FiUpload, FiX } from "react-icons/fi";
import { Project as ApiProject, UpdateProjectDto, projectApi } from "../../../lib/projectApi";

// components/dashboard/farmer/EditProjectModal.tsx

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
  Input,
  Textarea,
  Select,
  Button,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Image,
  IconButton,
  Text,
  Badge,
  Spinner,
} from '@chakra-ui/react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ApiProject | null; 
  onSave: (project: ApiProject) => void; 
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave
}) => {
  const [formData, setFormData] = useState<UpdateProjectDto>({
    title: '',
    description: '',
    category: '',
    fundingGoal: 0,
    timeline: '',
    location: '',
  });
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullProjectData, setFullProjectData] = useState<ApiProject | null>(null);
  
  const toast = useToast();

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

  // Fetch full project data when project changes
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (project?._id && isOpen) { // FIXED: Use _id instead of id
        setIsLoading(true);
        try {
          const fullProject = await projectApi.getProjectById(project._id); // FIXED: Use _id
          setFullProjectData(fullProject);
          
          // Set form data from full project
          setFormData({
            title: fullProject.title || '',
            description: fullProject.description || '',
            category: fullProject.category || '',
            fundingGoal: fullProject.fundingGoal || 0,
            timeline: fullProject.timeline || '',
            location: fullProject.location || '',
          });

          // Set existing images
          setExistingImages(fullProject.images || []);
        } catch (error) {
          console.error('Failed to load project details:', error);
          toast({
            title: 'Error',
            description: 'Failed to load project details',
            status: 'error',
            duration: 3000,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProjectDetails();
  }, [project?._id, isOpen]); // FIXED: Use _id instead of id

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewImages([]);
      setNewImagePreviews([]);
      setExistingImages([]);
      setFullProjectData(null);
    }
  }, [isOpen]);

  if (!project) return null;

  // Check if project can be edited
  const canEdit = project.status === 'submitted' || project.status === 'under_review';

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
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

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
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
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setNewImages(prev => [...prev, ...validFiles]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof UpdateProjectDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast({
        title: 'Cannot Edit',
        description: 'This project cannot be edited after it has been reviewed',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(newImages.length > 0);

    try {
      let allImages = [...existingImages];

      // Upload new images if any
      if (newImages.length > 0) {
        const imageUploadResult = await projectApi.uploadMultipleImages(newImages);
        allImages = [...allImages, ...imageUploadResult.urls];
      }

      // Prepare update data
      const updateData: UpdateProjectDto = {
        ...formData,
        images: allImages.length > 0 ? allImages : undefined,
      };

      // Update project via API - FIXED: Use _id
      const updatedProject = await projectApi.updateProject(project._id, updateData);
      
      toast({
        title: "Project Updated",
        description: "Your project has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Call onSave with the updated ApiProject
      onSave(updatedProject);
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your project.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <HStack>
              <Text>Edit Project</Text>
              <Badge colorScheme={canEdit ? 'green' : 'red'}>
                {canEdit ? 'Editable' : 'Read Only'}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600" fontWeight="normal">
              {project.title} {/* FIXED: Use title instead of name */}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          {isLoading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text color="gray.600">Loading project details...</Text>
            </VStack>
          ) : !canEdit ? (
            <Alert status="warning" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Project Cannot Be Edited</AlertTitle>
                <AlertDescription>
                  Projects can only be edited when they are in submitted or under review status.
                  This project is currently {project.status}.
                </AlertDescription>
              </Box>
            </Alert>
          ) : null}

          <VStack spacing={6} align="stretch" opacity={!canEdit || isLoading ? 0.6 : 1}>
            <FormControl isRequired isDisabled={!canEdit}>
              <FormLabel>Project Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter project name"
              />
            </FormControl>

            <FormControl isRequired isDisabled={!canEdit}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Describe your project"
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isDisabled={!canEdit}>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Select category"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired isDisabled={!canEdit}>
                <FormLabel>Location</FormLabel>
                <Select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Select location"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isDisabled={!canEdit}>
                <FormLabel>Funding Goal ($)</FormLabel>
                <Input
                  type="number"
                  min={1000}
                  value={formData.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', parseInt(e.target.value) || 0)}
                  placeholder="10000"
                />
              </FormControl>

              <FormControl isRequired isDisabled={!canEdit}>
                <FormLabel>Timeline / Expected Harvest</FormLabel>
                <Input
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 6 months, December 2025"
                />
              </FormControl>
            </SimpleGrid>

            {/* Image Management */}
            <FormControl isDisabled={!canEdit}>
              <FormLabel>Project Images</FormLabel>
              <VStack spacing={4} align="stretch">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>Current Images</Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {existingImages.map((image, index) => (
                        <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                          <Image
                            src={image}
                            alt={`Current image ${index + 1}`}
                            w="full"
                            h="100px"
                            objectFit="cover"
                          />
                          {canEdit && (
                            <IconButton
                              icon={<FiX />}
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={1}
                              right={1}
                              onClick={() => removeExistingImage(index)}
                              aria-label="Remove image"
                            />
                          )}
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* New Images */}
                {newImagePreviews.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>New Images</Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {newImagePreviews.map((preview, index) => (
                        <Box key={index} position="relative" borderRadius="md" overflow="hidden">
                          <Image
                            src={preview}
                            alt={`New image ${index + 1}`}
                            w="full"
                            h="100px"
                            objectFit="cover"
                          />
                          <Badge
                            position="absolute"
                            top={1}
                            left={1}
                            colorScheme="blue"
                            fontSize="xs"
                          >
                            New
                          </Badge>
                          <IconButton
                            icon={<FiX />}
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => removeNewImage(index)}
                            aria-label="Remove image"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Upload Button */}
                {canEdit && (
                  <Box
                    border="2px"
                    borderColor="gray.300"
                    borderStyle="dashed"
                    borderRadius="md"
                    p={4}
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ borderColor: 'brand.400', bg: 'gray.50' }}
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                  >
                    <VStack spacing={2}>
                      <FiUpload size={20} />
                      <Text fontSize="sm">Click to add more images</Text>
                      <Text fontSize="xs" color="gray.500">
                        PNG, JPG up to 5MB each
                      </Text>
                    </VStack>
                    <input
                      id="edit-image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </Box>
                )}
              </VStack>
            </FormControl>

            {isUploading && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">Uploading images...</Text>
              </Alert>
            )}

            <HStack spacing={4} justify="flex-end" pt={4}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                leftIcon={<FiSave />} 
                onClick={handleSave}
                isLoading={isSubmitting}
                loadingText={isUploading ? "Uploading..." : "Saving..."}
                isDisabled={!canEdit || isLoading}
              >
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};