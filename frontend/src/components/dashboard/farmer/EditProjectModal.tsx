import React, { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";

// EditProjectModal.tsx
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

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (project: Project) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave
}) => {
  const [editedProject, setEditedProject] = useState<Project | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (project) {
      setEditedProject({ ...project });
    }
  }, [project]);

  if (!editedProject) return null;

  const handleSave = () => {
    onSave(editedProject);
    toast({
      title: "Project Updated",
      description: "Your project has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  const handleInputChange = (field: keyof Project, value: string | number) => {
    setEditedProject(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Project Name</FormLabel>
              <Input
                value={editedProject.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={editedProject.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Describe your project"
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Select
                  value={editedProject.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  <option value="">Select location</option>
                  <option value="Kigali Province">Kigali Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Western Province">Western Province</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Phase</FormLabel>
                <Select
                  value={editedProject.phase}
                  onChange={(e) => handleInputChange('phase', e.target.value)}
                >
                  <option value="Planning">Planning</option>
                  <option value="Planting">Planting</option>
                  <option value="Growing">Growing</option>
                  <option value="Harvest">Harvest</option>
                  <option value="Completed">Completed</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Expected Harvest</FormLabel>
                <Input
                  value={editedProject.expectedHarvest}
                  onChange={(e) => handleInputChange('expectedHarvest', e.target.value)}
                  placeholder="e.g., December 2024"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Expected ROI</FormLabel>
                <Input
                  value={editedProject.roi}
                  onChange={(e) => handleInputChange('roi', e.target.value)}
                  placeholder="e.g., 25%"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={editedProject.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="funding">Funding</option>
                  <option value="completing">Completing</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Funding Goal</FormLabel>
                <Input
                  value={editedProject.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                  placeholder="e.g., $10,000"
                />
              </FormControl>
            </SimpleGrid>

            <HStack spacing={4} justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" leftIcon={<FiSave />} onClick={handleSave}>
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
