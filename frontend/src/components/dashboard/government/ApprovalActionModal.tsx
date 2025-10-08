import { useState } from "react";
import { ApprovalStep } from "@/types/government.types";

// ============================================
// FILE: components/government/ApprovalActionModal.tsx
// Modal for approving and moving to next step
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
  Text,
  Alert,
  AlertIcon,
  useToast,
  Box,
} from '@chakra-ui/react';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: ApprovalStep;
  projectName: string;
  onApprove: (nextStep: ApprovalStep, comment: string) => Promise<void>;
}

const WORKFLOW_STEPS = [
  { step: ApprovalStep.STEP_1_INITIAL_REVIEW, label: 'Initial Review' },
  { step: ApprovalStep.STEP_2_DOCUMENTATION, label: 'Documentation Verification' },
  { step: ApprovalStep.STEP_3_LAND_VERIFICATION, label: 'Land Verification' },
  { step: ApprovalStep.STEP_4_FINANCIAL_REVIEW, label: 'Financial Assessment' },
  { step: ApprovalStep.STEP_5_TECHNICAL_EVAL, label: 'Technical Evaluation' },
  { step: ApprovalStep.STEP_6_COMPLIANCE, label: 'Compliance Check' },
  { step: ApprovalStep.STEP_7_SITE_INSPECTION, label: 'Site Inspection' },
  { step: ApprovalStep.STEP_8_RISK_ASSESSMENT, label: 'Risk Assessment' },
  { step: ApprovalStep.STEP_9_FINAL_REVIEW, label: 'Final Review' },
  { step: ApprovalStep.STEP_10_APPROVED, label: 'Approved' },
];

export default function ApprovalActionModal({
  isOpen,
  onClose,
  currentStep,
  projectName,
  onApprove,
}: ApprovalActionModalProps) {
  const toast = useToast();
  const [comment, setComment] = useState('');
  const [nextStep, setNextStep] = useState<ApprovalStep>(ApprovalStep.STEP_2_DOCUMENTATION);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIndex = WORKFLOW_STEPS.findIndex(s => s.step === currentStep);
  const availableNextSteps = WORKFLOW_STEPS.slice(currentIndex + 1);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: 'Comment Required',
        description: 'Please provide a comment for this approval',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(nextStep, comment);
      toast({
        title: 'Step Approved',
        description: 'Project has been moved to the next approval step',
        status: 'success',
        duration: 3000,
      });
      setComment('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve step',
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
        <ModalHeader>Approve Current Step</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              <Box flex="1">
                <Text fontSize="sm" fontWeight="semibold">Project: {projectName}</Text>
                <Text fontSize="xs">Current Step: {WORKFLOW_STEPS[currentIndex]?.label}</Text>
              </Box>
            </Alert>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Move to Next Step</FormLabel>
              <Select
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value as ApprovalStep)}
              >
                {availableNextSteps.map((step) => (
                  <option key={step.step} value={step.step}>
                    {step.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Approval Comment</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide detailed comments on your review and approval decision..."
                rows={6}
              />
            </FormControl>

            <Alert status="success">
              <AlertIcon />
              <Text fontSize="xs">
                Approving this step will notify the farmer and move the project to the next approval stage.
              </Text>
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="green" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Approving..."
          >
            Approve & Move Forward
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
