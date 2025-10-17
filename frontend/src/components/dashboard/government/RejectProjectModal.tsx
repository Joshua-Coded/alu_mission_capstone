import { useState } from "react";
import { FiAlertTriangle, FiInfo, FiMail, FiXCircle } from "react-icons/fi";
import { Project, projectApi } from "@/lib/projectApi";

// ============================================
// FILE: components/dashboard/government/RejectProjectModal.tsx
// Modal for rejecting a project
// ============================================
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
  Select,
  Alert,
  AlertIcon,
  useToast,
  Checkbox,
  Box,
  Text,
  HStack,
  Icon,
  Divider,
  Badge,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';

interface RejectProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RejectProjectModal({
  isOpen,
  onClose,
  project,
  onConfirm,
}: RejectProjectModalProps) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [notifyFarmer, setNotifyFarmer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rejectionReasons = [
    { 
      value: 'Insufficient Documentation', 
      label: 'Insufficient Documentation',
      description: 'Missing or incomplete required documents'
    },
    { 
      value: 'Land Verification Failed', 
      label: 'Land Verification Failed',
      description: 'Unable to verify land ownership or certificates'
    },
    { 
      value: 'Financial Viability Concerns', 
      label: 'Financial Viability Concerns',
      description: 'Project financials are not sustainable'
    },
    { 
      value: 'Technical Infeasibility', 
      label: 'Technical Infeasibility',
      description: 'Technical approach is not viable'
    },
    { 
      value: 'Compliance Issues', 
      label: 'Compliance Issues',
      description: 'Does not meet regulatory requirements'
    },
    { 
      value: 'Environmental Concerns', 
      label: 'Environmental Concerns',
      description: 'Potential negative environmental impact'
    },
    { 
      value: 'High Risk Assessment', 
      label: 'High Risk Assessment',
      description: 'Project risk level is too high'
    },
    { 
      value: 'Duplicate Project', 
      label: 'Duplicate Project',
      description: 'Similar project already exists'
    },
    { 
      value: 'Fraud Suspicion', 
      label: 'Fraud Suspicion',
      description: 'Suspicious activity detected'
    },
    { 
      value: 'Other', 
      label: 'Other Reason',
      description: 'Specify in detailed explanation'
    },
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a rejection reason',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Explanation Required',
        description: 'Please provide a detailed explanation for rejection',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build comprehensive rejection reason
      const fullReason = `
REJECTION REASON: ${reason}

Detailed Explanation:
${comment}

---
Rejected by: Government Official
Date: ${new Date().toLocaleDateString()}
Project: ${project.title}
${notifyFarmer ? '\nNote: Farmer has been notified via email' : ''}
      `.trim();

      // Call the onConfirm function from parent
      await onConfirm(fullReason);

      toast({
        title: 'Project Rejected',
        description: notifyFarmer 
          ? 'Project rejected and farmer has been notified' 
          : 'Project has been rejected',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setReason('');
      setComment('');
      setNotifyFarmer(true);
      onClose();
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject project. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setComment('');
    setNotifyFarmer(true);
    onClose();
  };

  const selectedReasonData = rejectionReasons.find(r => r.value === reason);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.600">
          <HStack>
            <Icon as={FiXCircle} />
            <Text>Reject Project</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5} align="stretch">
            {/* Warning Alert */}
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <Text fontSize="sm" fontWeight="semibold">
                  Project: {project.title}
                </Text>
                <Text fontSize="xs" color="gray.700">
                  This action will permanently reject this project submission
                </Text>
              </Box>
            </Alert>

            {/* Project Quick Info */}
            <Box bg="gray.50" p={3} borderRadius="md">
              <HStack justify="space-between" fontSize="sm">
                <Box>
                  <Text color="gray.600">Category:</Text>
                  <Text fontWeight="semibold">{project.category}</Text>
                </Box>
                <Box>
                  <Text color="gray.600">Funding Goal:</Text>
                  <Text fontWeight="semibold">${project.fundingGoal.toLocaleString()}</Text>
                </Box>
                <Box>
                  <Text color="gray.600">Location:</Text>
                  <Text fontWeight="semibold">{project.location}</Text>
                </Box>
              </HStack>
            </Box>

            <Divider />

            {/* Rejection Reason */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">
                <HStack>
                  <Icon as={FiAlertTriangle} />
                  <Text>Primary Rejection Reason</Text>
                </HStack>
              </FormLabel>
              <Select
                placeholder="Select the main reason for rejection"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="md"
              >
                {rejectionReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
              {selectedReasonData && (
                <Text fontSize="xs" color="gray.600" mt={2} fontStyle="italic">
                  {selectedReasonData.description}
                </Text>
              )}
            </FormControl>

            {/* Detailed Explanation */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">
                Detailed Explanation for Farmer
              </FormLabel>
              <Text fontSize="xs" color="gray.600" mb={2}>
                Provide clear, constructive feedback explaining why the project is being rejected
              </Text>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Example: Your business plan lacks detailed market analysis and the financial projections appear unrealistic. The land documents provided do not clearly show ownership verification..."
                rows={6}
                fontSize="sm"
              />
              <HStack justify="space-between" mt={1}>
                <Text fontSize="xs" color="gray.500">
                  Be professional and constructive
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {comment.length} characters
                </Text>
              </HStack>
            </FormControl>

            <Divider />

            {/* Notification Options */}
            <FormControl>
              <HStack spacing={3} align="start">
                <Checkbox
                  isChecked={notifyFarmer}
                  onChange={(e) => setNotifyFarmer(e.target.checked)}
                  colorScheme="blue"
                >
                  <HStack>
                    <Icon as={FiMail} color="blue.500" />
                    <Text fontSize="sm">Notify farmer via email</Text>
                  </HStack>
                </Checkbox>
              </HStack>
              <Text fontSize="xs" color="gray.600" mt={2} ml={6}>
                The farmer will receive an email with the rejection reason and your detailed explanation
              </Text>
            </FormControl>

            {/* Important Information */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                  Important Information
                </Text>
                <List spacing={1} fontSize="xs">
                  <ListItem>
                    <ListIcon as={FiInfo} color="orange.500" />
                    This action cannot be undone
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiInfo} color="orange.500" />
                    The project status will change to "Rejected"
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiInfo} color="orange.500" />
                    The farmer can submit a new improved project later
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiInfo} color="orange.500" />
                    Your feedback should be constructive and professional
                  </ListItem>
                </List>
              </Box>
            </Alert>

            {/* Farmer Information */}
            {project.farmer && typeof project.farmer === 'object' && (
              <Box bg="blue.50" p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="semibold" color="blue.700" mb={1}>
                  Farmer Information
                </Text>
                <HStack fontSize="xs" color="gray.700">
                  <Text>
                    {project.farmer.firstName} {project.farmer.lastName}
                  </Text>
                  {project.farmer.email && (
                    <>
                      <Text>•</Text>
                      <Text>{project.farmer.email}</Text>
                    </>
                  )}
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Rejecting..."
              isDisabled={!reason || !comment.trim()}
              leftIcon={<FiXCircle />}
            >
              Reject Project
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}