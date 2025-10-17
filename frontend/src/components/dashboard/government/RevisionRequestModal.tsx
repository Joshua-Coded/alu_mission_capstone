import { useState } from "react";
import { FiAlertCircle, FiCalendar, FiFileText } from "react-icons/fi";
import { Project, projectApi } from "@/lib/projectApi";

// ============================================
// FILE: components/dashboard/government/RevisionRequestModal.tsx
// Modal for requesting revisions from farmer
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
  Alert,
  AlertIcon,
  useToast,
  Checkbox,
  Box,
  Text,
  CheckboxGroup,
  Stack,
  Input,
  HStack,
  Badge,
  Icon,
  Divider,
} from '@chakra-ui/react';

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onConfirm: (notes: string) => Promise<void>;
}

export default function RevisionRequestModal({
  isOpen,
  onClose,
  project,
  onConfirm,
}: RevisionRequestModalProps) {
  const toast = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const revisionItems = [
    { id: 'business_plan', label: 'Update Business Plan', category: 'Documentation' },
    { id: 'land_docs', label: 'Provide Additional Land Documents', category: 'Documentation' },
    { id: 'financial', label: 'Clarify Financial Projections', category: 'Financial' },
    { id: 'technical', label: 'Submit Technical Specifications', category: 'Technical' },
    { id: 'environmental', label: 'Update Environmental Impact Assessment', category: 'Environmental' },
    { id: 'references', label: 'Provide Additional References', category: 'Documentation' },
    { id: 'timeline', label: 'Clarify Project Timeline', category: 'Technical' },
    { id: 'budget', label: 'Update Budget Breakdown', category: 'Financial' },
    { id: 'images', label: 'Upload Better Project Images', category: 'Documentation' },
    { id: 'location', label: 'Provide Detailed Location Information', category: 'Technical' },
  ];

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  // Get default due date (7 days from now)
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Select Required Revisions',
        description: 'Please select at least one item that needs revision',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Instructions Required',
        description: 'Please provide detailed instructions for the farmer',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build comprehensive revision notes
      const revisionNotes = `
REVISION REQUESTED

Required Changes:
${selectedItems.map(id => {
  const item = revisionItems.find(i => i.id === id);
  return `• ${item?.label}`;
}).join('\n')}

Detailed Instructions:
${comment}

${dueDate ? `Due Date: ${new Date(dueDate).toLocaleDateString()}` : 'Please address these items as soon as possible.'}

---
Requested by: Government Official
Date: ${new Date().toLocaleDateString()}
Project: ${project.title}
      `.trim();

      // Call the onConfirm function passed from parent
      await onConfirm(revisionNotes);

      toast({
        title: 'Revision Requested ✓',
        description: 'The farmer has been notified of the required revisions',
        status: 'success',
        duration: 5000,
      });

      // Reset form
      setSelectedItems([]);
      setComment('');
      setDueDate('');
      onClose();
    } catch (error: any) {
      console.error('Error requesting revision:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to request revision',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedItems([]);
    setComment('');
    setDueDate('');
    onClose();
  };

  // Group items by category
  const groupedItems = revisionItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof revisionItems>);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="orange.600">
          <HStack>
            <Icon as={FiAlertCircle} />
            <Text>Request Revisions</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5} align="stretch">
            {/* Project Info Alert */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <Text fontSize="sm" fontWeight="semibold">
                  Project: {project.title}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Category: {project.category} • Location: {project.location}
                </Text>
              </Box>
            </Alert>

            <Divider />

            {/* Required Revisions by Category */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">
                <HStack>
                  <Icon as={FiFileText} />
                  <Text>Select Required Revisions</Text>
                  {selectedItems.length > 0 && (
                    <Badge colorScheme="orange">{selectedItems.length} selected</Badge>
                  )}
                </HStack>
              </FormLabel>
              <Text fontSize="xs" color="gray.600" mb={3}>
                Check all items that need to be revised or improved
              </Text>
              
              <CheckboxGroup 
                value={selectedItems} 
                onChange={(values) => setSelectedItems(values as string[])}
              >
                <VStack align="stretch" spacing={4}>
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <Box key={category}>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        {category}
                      </Text>
                      <Stack spacing={2} pl={2}>
                        {items.map((item) => (
                          <Checkbox key={item.id} value={item.id}>
                            <Text fontSize="sm">{item.label}</Text>
                          </Checkbox>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </VStack>
              </CheckboxGroup>
            </FormControl>

            <Divider />

            {/* Detailed Instructions */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="bold">
                Detailed Instructions for Farmer
              </FormLabel>
              <Text fontSize="xs" color="gray.600" mb={2}>
                Provide clear, specific instructions on what needs to be changed and why
              </Text>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Example: Please update your business plan to include more detailed market analysis for your target customers. Your current plan lacks specific information about pricing strategy and expected sales volumes..."
                rows={6}
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Be specific and constructive in your feedback
              </Text>
            </FormControl>

            {/* Due Date (Optional) */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>Revision Due Date (Optional)</Text>
                </HStack>
              </FormLabel>
              <Text fontSize="xs" color="gray.600" mb={2}>
                Set a deadline for when revisions should be completed
              </Text>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={today}
                placeholder={defaultDueDate}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Recommended: 7-14 days from today
              </Text>
            </FormControl>

            {/* Warning Alert */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="semibold">
                  Project Status Change
                </Text>
                <Text fontSize="xs">
                  The project will remain in "Under Review" status with notes attached. 
                  The farmer will be notified via their dashboard.
                </Text>
              </Box>
            </Alert>
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
              colorScheme="orange"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Requesting..."
              isDisabled={selectedItems.length === 0 || !comment.trim()}
            >
              Request Revisions
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}