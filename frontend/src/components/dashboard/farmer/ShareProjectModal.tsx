import React from "react";
import { FiCopy, FiMail, FiShare2 } from "react-icons/fi";

// ShareProjectModal.tsx
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
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Divider,
} from '@chakra-ui/react';
// Add this interface at the top of ShareProjectModal.tsx
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
  
  // Keep the rest of your ShareProjectModal code the same

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const toast = useToast();

  if (!project) return null;

  const shareUrl = `${window.location.origin}/projects/${project.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Project link has been copied to clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link. Please copy manually.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this farming project: ${project.name}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this farming project:\n\n` +
      `${project.name}\n` +
      `${project.description}\n\n` +
      `Location: ${project.location}\n` +
      `Expected ROI: ${project.roi}\n` +
      `Expected Harvest: ${project.expectedHarvest}\n\n` +
      `View more details: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Check out this farming project: ${project.name}\n\n` +
      `${project.description}\n\n` +
      `Location: ${project.location}\n` +
      `Expected ROI: ${project.roi}\n\n` +
      `View details: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Exciting farming project: ${project.name} in ${project.location}. Expected ROI: ${project.roi}. #Agriculture #Farming #Investment`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Share Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Project Preview */}
            <Box p={4} bg="gray.50" borderRadius="lg">
              <VStack spacing={2} align="start">
                <Text fontSize="lg" fontWeight="bold">{project.name}</Text>
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {project.description}
                </Text>
                <HStack spacing={4}>
                  <Text fontSize="xs" color="gray.500">📍 {project.location}</Text>
                  <Text fontSize="xs" color="gray.500">💰 {project.roi} ROI</Text>
                  <Text fontSize="xs" color="gray.500">🌾 {project.expectedHarvest}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Share Link */}
            <FormControl>
              <FormLabel fontSize="sm">Project Link</FormLabel>
              <HStack>
                <Input 
                  value={shareUrl} 
                  isReadOnly 
                  size="sm"
                  bg="gray.50"
                />
                <Button 
                  onClick={handleCopyLink} 
                  size="sm"
                  leftIcon={<FiCopy />}
                >
                  Copy
                </Button>
              </HStack>
            </FormControl>

            <Divider />

            {/* Share Options */}
            <VStack spacing={3}>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Share via
              </Text>
              
              <Button
                leftIcon={<FiMail />}
                colorScheme="blue"
                variant="outline"
                w="full"
                onClick={handleEmailShare}
              >
                Email
              </Button>
              
              <Button
                leftIcon={<FiShare2 />}
                colorScheme="green"
                variant="outline"
                w="full"
                onClick={handleWhatsAppShare}
              >
                WhatsApp
              </Button>
              
              <Button
                leftIcon={<FiShare2 />}
                colorScheme="twitter"
                variant="outline"
                w="full"
                onClick={handleTwitterShare}
              >
                Twitter
              </Button>

              {/* Native Share API (if available) */}
              {navigator.share && (
                <Button
                  leftIcon={<FiShare2 />}
                  colorScheme="purple"
                  variant="outline"
                  w="full"
                  onClick={() => {
                    navigator.share({
                      title: project.name,
                      text: project.description,
                      url: shareUrl,
                    });
                  }}
                >
                  More Options
                </Button>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};