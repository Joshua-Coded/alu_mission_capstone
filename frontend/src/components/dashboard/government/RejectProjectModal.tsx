// ============================================
// FILE: components/government/RejectProjectModal.tsx
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
  } from '@chakra-ui/react';
  import { useState } from 'react';
  
  interface RejectProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    onReject: (reason: string, comment: string, notifyFarmer: boolean) => Promise<void>;
  }
  
  export default function RejectProjectModal({
    isOpen,
    onClose,
    projectName,
    onReject,
  }: RejectProjectModalProps) {
    const toast = useToast();
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [notifyFarmer, setNotifyFarmer] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const rejectionReasons = [
      'Insufficient Documentation',
      'Land Verification Failed',
      'Financial Viability Concerns',
      'Technical Infeasibility',
      'Compliance Issues',
      'Environmental Concerns',
      'High Risk Assessment',
      'Duplicate Project',
      'Other',
    ];
  
    const handleSubmit = async () => {
      if (!reason || !comment.trim()) {
        toast({
          title: 'Information Required',
          description: 'Please select a reason and provide detailed comments',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
  
      setIsSubmitting(true);
      try {
        await onReject(reason, comment, notifyFarmer);
        toast({
          title: 'Project Rejected',
          description: 'The farmer has been notified of the rejection',
          status: 'info',
          duration: 3000,
        });
        setReason('');
        setComment('');
        onClose();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to reject project',
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
          <ModalHeader color="red.600">Reject Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning">
                <AlertIcon />
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="semibold">Project: {projectName}</Text>
                  <Text fontSize="xs">This action will permanently reject this project submission.</Text>
                </Box>
              </Alert>
  
              <FormControl isRequired>
                <FormLabel fontSize="sm">Rejection Reason</FormLabel>
                <Select
                  placeholder="Select rejection reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {rejectionReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </FormControl>
  
              <FormControl isRequired>
                <FormLabel fontSize="sm">Detailed Explanation</FormLabel>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide detailed explanation for the rejection. This will be shared with the farmer..."
                  rows={6}
                />
              </FormControl>
  
              <Checkbox
                isChecked={notifyFarmer}
                onChange={(e) => setNotifyFarmer(e.target.checked)}
              >
                <Text fontSize="sm">Notify farmer via email</Text>
              </Checkbox>
  
              <Alert status="error">
                <AlertIcon />
                <Text fontSize="xs">
                  This action cannot be undone. The farmer will need to submit a new project if they wish to reapply.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Rejecting..."
            >
              Reject Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }