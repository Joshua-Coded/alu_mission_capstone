"use client";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Project as ApiProject } from "@/lib/projectApi";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Alert,
  AlertIcon,
  useToast,
  Box,
  HStack,
  Icon,
  Divider,
  Badge,
} from '@chakra-ui/react';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  project: ApiProject | null;
}

export default function ApprovalActionModal({
  isOpen,
  onClose,
  onConfirm,
  project,
}: ApprovalActionModalProps) {
  const toast = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Comment Required',
        description: 'Please provide approval notes before proceeding',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comment);
      toast({
        title: 'Project Approved ✓',
        description: 'The farmer has been notified and project is now active',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      setComment('');
      onClose();
    } catch (error: unknown) {
      toast({
        title: 'Approval Failed',
        description: error instanceof Error ? error.message : 'Failed to approve project. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setComment('');
      onClose();
    }
  };

  if (!project) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      closeOnOverlayClick={!isSubmitting}
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiCheckCircle} color="green.500" boxSize={6} />
            <Text color="green.600">Approve Project</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        
        <ModalBody>
          <VStack spacing={5} align="stretch">
            {/* Project Info */}
            <Box p={4} bg="green.50" borderRadius="lg" borderWidth="1px" borderColor="green.200">
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color="green.800">
                    {project.title}
                  </Text>
                  <Badge colorScheme="green" fontSize="xs">
                    Approval
                  </Badge>
                </HStack>
                <HStack spacing={4} fontSize="xs" color="green.700">
                  <Text>ID: {project.projectId || project._id.slice(-8)}</Text>
                  <Text>•</Text>
                  <Text>Goal: ${project.fundingGoal?.toLocaleString()}</Text>
                  <Text>•</Text>
                  <Text>{project.location}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Approval Notes */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Approval Notes <Text as="span" color="red.500">*</Text>
              </FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter detailed approval notes: verification findings, compliance status, recommendations..."
                rows={6}
                resize="vertical"
                focusBorderColor="green.400"
              />
              <Text fontSize="xs" color="gray.500" mt={2}>
                {comment.length}/500 characters • These notes will be visible to the farmer
              </Text>
            </FormControl>

            <Divider />

            {/* Warning Alert */}
            <Alert status="success" borderRadius="lg" variant="left-accent">
              <AlertIcon as={FiCheckCircle} />
              <Box fontSize="sm">
                <Text fontWeight="medium" mb={1}>
                  Project will be activated
                </Text>
                <Text fontSize="xs" color="gray.600">
                  • Project becomes visible to investors for funding<br />
                  • Farmer receives approval notification<br />
                  • Project status changes to &quot;Active&quot;
                </Text>
              </Box>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button 
              variant="ghost" 
              onClick={handleClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Approving..."
              leftIcon={<FiCheckCircle />}
              isDisabled={!comment.trim()}
            >
              Approve Project
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}