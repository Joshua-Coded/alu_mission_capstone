import React, { useEffect, useState } from "react";
import { Project as ApiProject, projectApi } from "../../../lib/projectApi";

// components/dashboard/farmer/ProjectDetailsModal.tsx

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Image,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
  Spinner,
  useToast,
  Icon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiSend
} from 'react-icons/fi';

interface Project {
  id: string;
  name: string;
  progress: number;
  funding: string;
  fundingGoal: string;
  investors: number;
  phase: string;
  roi: string;
  status: string;
  description: string;
  expectedHarvest: string;
  location: string;
  images?: string[];
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [fullProject, setFullProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Fetch full project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (project?.id && isOpen) {
        setIsLoading(true);
        try {
          const data = await projectApi.getProjectById(project.id);
          setFullProject(data);
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to load project details',
            status: 'error',
            duration: 3000,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProjectDetails();
  }, [project?.id, isOpen]);

  if (!project) return null;

  const handleSubmitForReview = async () => {
    if (!fullProject || fullProject.status !== 'draft') {
      toast({
        title: 'Cannot Submit',
        description: 'Only draft projects can be submitted for review',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await projectApi.submitProject(project.id);
      
      toast({
        title: 'Submitted Successfully',
        description: 'Your project has been submitted for government verification',
        status: 'success',
        duration: 5000,
      });

      // Refresh project details
      const updatedData = await projectApi.getProjectById(project.id);
      setFullProject(updatedData);
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit project',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'gray',
      submitted: 'yellow',
      under_review: 'blue',
      active: 'green',
      rejected: 'red',
      funded: 'purple',
      closed: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      active: 'Active',
      rejected: 'Rejected',
      funded: 'Funded',
      closed: 'Closed',
    };
    return labels[status] || status;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <HStack>
              <Text>{project.name}</Text>
              {fullProject && (
                <Badge colorScheme={getStatusColor(fullProject.status)}>
                  {getStatusLabel(fullProject.status)}
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.600" fontWeight="normal">
              {project.description}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {isLoading ? (
            <VStack spacing={4} py={12}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text color="gray.600">Loading project details...</Text>
            </VStack>
          ) : fullProject ? (
            <Tabs variant="enclosed" colorScheme="brand">
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Details</Tab>
                <Tab>Due Diligence</Tab>
                <Tab>Documents</Tab>
              </TabList>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Quick Actions */}
                    {fullProject.status === 'draft' && (
                      <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                        <VStack spacing={3}>
                          <HStack>
                            <Icon as={FiSend} color="blue.500" />
                            <Text fontWeight="medium" color="blue.800">
                              Ready to submit?
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="blue.700">
                            Submit your project for government verification to make it visible to investors.
                          </Text>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={handleSubmitForReview}
                            isLoading={isSubmitting}
                            loadingText="Submitting..."
                            leftIcon={<FiSend />}
                          >
                            Submit for Review
                          </Button>
                        </VStack>
                      </Box>
                    )}

                    {/* Key Stats */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Stat>
                        <StatLabel fontSize="xs">Funding Goal</StatLabel>
                        <StatNumber fontSize="lg">
                          ${fullProject.fundingGoal.toLocaleString()}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel fontSize="xs">Current Funding</StatLabel>
                        <StatNumber fontSize="lg">
                          ${fullProject.currentFunding.toLocaleString()}
                        </StatNumber>
                        <StatHelpText>
                          {Math.round((fullProject.currentFunding / fullProject.fundingGoal) * 100)}% funded
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel fontSize="xs">Contributors</StatLabel>
                        <StatNumber fontSize="lg">{fullProject.contributorsCount}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel fontSize="xs">Category</StatLabel>
                        <StatNumber fontSize="md">{fullProject.category}</StatNumber>
                      </Stat>
                    </SimpleGrid>

                    {/* Funding Progress */}
                    <Box>
                      <Text fontWeight="semibold" color="brand.600" mb={3}>
                        Funding Progress
                      </Text>
                      <Progress 
                        value={(fullProject.currentFunding / fullProject.fundingGoal) * 100} 
                        colorScheme="brand" 
                        size="lg" 
                        borderRadius="md"
                      />
                      <HStack justify="space-between" mt={2}>
                        <Text fontSize="sm" color="gray.600">
                          ${fullProject.currentFunding.toLocaleString()} raised
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ${fullProject.fundingGoal.toLocaleString()} goal
                        </Text>
                      </HStack>
                    </Box>

                    {/* Project Images */}
                    {fullProject.images && fullProject.images.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" color="brand.600" mb={3}>
                          Project Images
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {fullProject.images.map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`${fullProject.title} ${index + 1}`}
                              borderRadius="lg"
                              w="full"
                              h="200px"
                              objectFit="cover"
                            />
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>

                {/* Details Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontWeight="semibold" color="brand.600" mb={3}>
                        Project Information
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <HStack>
                          <Icon as={FiMapPin} color="gray.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.600">Location</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.location}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack>
                          <Icon as={FiCalendar} color="gray.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.600">Timeline</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.timeline}</Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiDollarSign} color="gray.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.600">Category</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.category}</Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiClock} color="gray.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.600">Created</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {new Date(fullProject.createdAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="semibold" color="brand.600" mb={3}>
                        Description
                      </Text>
                      <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                        {fullProject.description}
                      </Text>
                    </Box>

                    {fullProject.farmer && typeof fullProject.farmer !== 'string' && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontWeight="semibold" color="brand.600" mb={3}>
                            Farmer Information
                          </Text>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm">
                              <strong>Name:</strong> {fullProject.farmer.firstName} {fullProject.farmer.lastName}
                            </Text>
                            <Text fontSize="sm">
                              <strong>Email:</strong> {fullProject.farmer.email}
                            </Text>
                            {fullProject.farmer.phoneNumber && (
                              <Text fontSize="sm">
                                <strong>Phone:</strong> {fullProject.farmer.phoneNumber}
                              </Text>
                            )}
                            {fullProject.farmer.location && (
                              <Text fontSize="sm">
                                <strong>Location:</strong> {fullProject.farmer.location}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                {/* Due Diligence Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="semibold" color="brand.600">
                      Due Diligence Status
                    </Text>
                    
                    {fullProject.dueDiligence ? (
                      <VStack align="stretch" spacing={4}>
                        <Box p={4} bg="gray.50" borderRadius="lg">
                          <HStack spacing={3} mb={3}>
                            <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
                            <Text fontWeight="medium">Status: {fullProject.dueDiligence.status}</Text>
                          </HStack>
                          
                          {fullProject.dueDiligence.assignedTo && (
                            <Text fontSize="sm" color="gray.600" mb={2}>
                              Assigned to: {typeof fullProject.dueDiligence.assignedTo === 'string' 
                                ? fullProject.dueDiligence.assignedTo 
                                : `${fullProject.dueDiligence.assignedTo.firstName} ${fullProject.dueDiligence.assignedTo.lastName}`}
                            </Text>
                          )}
                          
                          {fullProject.dueDiligence.notes && (
                            <Box mt={3}>
                              <Text fontSize="sm" fontWeight="medium" mb={1}>Notes:</Text>
                              <Text fontSize="sm" color="gray.700">
                                {fullProject.dueDiligence.notes}
                              </Text>
                            </Box>
                          )}
                        </Box>

                        {fullProject.dueDiligence.documents && fullProject.dueDiligence.documents.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>
                              Due Diligence Documents:
                            </Text>
                            <List spacing={2}>
                              {fullProject.dueDiligence.documents.map((doc, index) => (
                                <ListItem key={index} fontSize="sm">
                                  <ListIcon as={FiFileText} color="blue.500" />
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    {doc.name}
                                  </a>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </VStack>
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        No due diligence information available yet.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>

                {/* Documents Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="semibold" color="brand.600">
                      Project Documents
                    </Text>
                    
                    {fullProject.documents && fullProject.documents.length > 0 ? (
                      <List spacing={3}>
                        {fullProject.documents.map((doc, index) => (
                          <ListItem 
                            key={index} 
                            p={3} 
                            bg="gray.50" 
                            borderRadius="md"
                            _hover={{ bg: 'gray.100' }}
                          >
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={FiFileText} color="blue.500" />
                                <Text fontSize="sm" fontWeight="medium">{doc.name}</Text>
                              </HStack>
                              <Button
                                as="a"
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="xs"
                                colorScheme="blue"
                                variant="outline"
                              >
                                Download
                              </Button>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        No documents uploaded for this project.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text>No project data available</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProjectDetailsModal;