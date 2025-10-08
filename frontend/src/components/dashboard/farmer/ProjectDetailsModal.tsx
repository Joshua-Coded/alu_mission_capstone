import React from "react";

// Remove this line - it conflicts with your local interface
// import { Project } from "../../../types/farmer";

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
} from '@chakra-ui/react';

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
  if (!project) return null;

  // Helper function to parse currency strings
  const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[$,]/g, ''));
  };

  const currentFunding = parseAmount(project.funding);
  const fundingGoal = parseAmount(project.fundingGoal);
  const roiNumber = parseFloat(project.roi.replace(/%/g, ''));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <HStack>
              <Text>{project.name}</Text>
              <Badge colorScheme="green">{project.phase}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {project.description}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs variant="enclosed" colorScheme="brand">
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Progress</Tab>
              <Tab>Investors</Tab>
              <Tab>Updates</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="semibold" color="brand.600">Project Details</Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Phase:</Text>
                          <Text fontSize="sm">{project.phase}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Location:</Text>
                          <Text fontSize="sm">{project.location}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Status:</Text>
                          <Text fontSize="sm" textTransform="capitalize">{project.status}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Expected Harvest:</Text>
                          <Text fontSize="sm">{project.expectedHarvest}</Text>
                        </HStack>
                      </VStack>
                    </VStack>

                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="semibold" color="brand.600">Financial Info</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <Stat>
                          <StatLabel>Funding Goal</StatLabel>
                          <StatNumber fontSize="lg">{project.fundingGoal}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Current Funding</StatLabel>
                          <StatNumber fontSize="lg">{project.funding}</StatNumber>
                          <StatHelpText>{project.progress}% funded</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel>Expected ROI</StatLabel>
                          <StatNumber fontSize="lg">{project.roi}</StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Investors</StatLabel>
                          <StatNumber fontSize="lg">{project.investors}</StatNumber>
                        </Stat>
                      </SimpleGrid>
                    </VStack>
                  </SimpleGrid>

                  <Box>
                    <Text fontWeight="semibold" color="brand.600" mb={3}>Funding Progress</Text>
                    <Progress 
                      value={project.progress} 
                      colorScheme="brand" 
                      size="lg" 
                      borderRadius="md"
                    />
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm" color="gray.600">
                        {project.funding} raised
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {project.fundingGoal} goal
                      </Text>
                    </HStack>
                  </Box>

                  {/* Project Images */}
                  {project.images && project.images.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" color="brand.600" mb={3}>Project Images</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {project.images.map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`${project.name} ${index + 1}`}
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

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="semibold" color="brand.600">Project Timeline</Text>
                  <Box p={4} bg="blue.50" borderRadius="lg">
                    <HStack spacing={3}>
                      <Badge colorScheme="blue" size="lg">
                        {project.phase}
                      </Badge>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold">Current Phase: {project.phase}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Expected completion: {project.expectedHarvest}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Text color="gray.500">Detailed timeline visualization coming soon...</Text>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="semibold" color="brand.600">Investor List</Text>
                  <Text color="gray.500">Investor details coming soon...</Text>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="semibold" color="brand.600">Project Updates</Text>
                  <Text color="gray.500">No updates yet</Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProjectDetailsModal;