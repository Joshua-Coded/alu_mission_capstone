// ============================================
// FILE: components/government/RevisionRequestModal.tsx
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
    Select,
    Alert,
    AlertIcon,
    useToast,
    Checkbox,
    Box,
    Text,
    CheckboxGroup,
    Stack,
    Input,  // Add this import
  } from '@chakra-ui/react';
  import { useState } from 'react';
  
  interface RevisionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    onRequestRevision: (items: string[], comment: string, dueDate: string) => Promise<void>;
  }
  
  export default function RevisionRequestModal({
    isOpen,
    onClose,
    projectName,
    onRequestRevision,
  }: RevisionRequestModalProps) {
    const toast = useToast();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const revisionItems = [
      'Update Business Plan',
      'Provide Additional Land Documents',
      'Clarify Financial Projections',
      'Submit Technical Specifications',
      'Update Environmental Impact Assessment',
      'Provide Additional References',
      'Clarify Project Timeline',
      'Update Budget Breakdown',
    ];
  
    const handleSubmit = async () => {
      if (selectedItems.length === 0 || !comment.trim() || !dueDate) {
        toast({
          title: 'Information Required',
          description: 'Please select items, provide comments, and set a due date',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
  
      setIsSubmitting(true);
      try {
        await onRequestRevision(selectedItems, comment, dueDate);
        toast({
          title: 'Revision Requested',
          description: 'The farmer has been notified of the required revisions',
          status: 'info',
          duration: 3000,
        });
        setSelectedItems([]);
        setComment('');
        setDueDate('');
        onClose();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to request revision',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="orange.600">Request Revisions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="semibold">Project: {projectName}</Text>
                  <Text fontSize="xs">Request specific revisions from the farmer before proceeding.</Text>
                </Box>
              </Alert>
  
              <FormControl isRequired>
                <FormLabel fontSize="sm">Required Revisions</FormLabel>
                <CheckboxGroup value={selectedItems} onChange={(values) => setSelectedItems(values as string[])}>
                  <Stack spacing={2}>
                    {revisionItems.map((item) => (
                      <Checkbox key={item} value={item}>
                        <Text fontSize="sm">{item}</Text>
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
  
              <FormControl isRequired>
                <FormLabel fontSize="sm">Detailed Instructions</FormLabel>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide detailed instructions on what needs to be revised and how..."
                  rows={6}
                />
              </FormControl>
  
              <FormControl isRequired>
                <FormLabel fontSize="sm">Revision Due Date</FormLabel>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
  
              <Alert status="warning">
                <AlertIcon />
                <Text fontSize="xs">
                  The project will be put on hold until the farmer submits the requested revisions.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="orange" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Requesting..."
            >
              Request Revisions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
  