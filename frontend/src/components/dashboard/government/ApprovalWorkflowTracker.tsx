import { SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiCircle, FiClock } from "react-icons/fi";
import { Project, ProjectStatus, projectApi } from "@/lib/projectApi";

// ============================================
// FILE: components/government/ApprovalWorkflowTracker.tsx
// ============================================
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  HStack,
  Box,
  Text,
  Progress,
  useColorModeValue,
  Icon,
  Button,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Textarea,
  useToast,
} from '@chakra-ui/react';

interface ApprovalWorkflowTrackerProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

// Define workflow steps based on project status
const WORKFLOW_STEPS = [
  { 
    status: 'submitted',
    label: 'Step 1: Initial Submission', 
    description: 'Project submitted by farmer and awaiting review',
    requiredActions: [
      'Verify farmer identity and contact information',
      'Check project category and type',
      'Review basic project information',
      'Confirm all required forms are submitted'
    ]
  },
  { 
    status: 'under_review',
    label: 'Step 2: Under Review', 
    description: 'Government official conducting detailed review',
    requiredActions: [
      'Complete due diligence checklist',
      'Verify all documentation',
      'Assess financial viability',
      'Check technical feasibility',
      'Evaluate compliance requirements'
    ]
  },
  { 
    status: 'active',
    label: 'Step 3: Approved & Active', 
    description: 'Project approved and ready for funding',
    requiredActions: [
      'Project is live on the platform',
      'Contributors can now fund this project',
      'Farmer can receive contributions',
      'Monitor project progress'
    ]
  },
  { 
    status: 'funded',
    label: 'Step 4: Fully Funded', 
    description: 'Project has reached funding goal',
    requiredActions: [
      'Funding goal achieved',
      'Ready for project implementation',
      'Track project milestones',
      'Monitor farmer progress'
    ]
  },
  { 
    status: 'closed',
    label: 'Step 5: Completed', 
    description: 'Project successfully completed',
    requiredActions: []
  },
];

export default function ApprovalWorkflowTracker({ project, onUpdate }: ApprovalWorkflowTrackerProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();
  const [stepNotes, setStepNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find current step based on project status
  const currentStepIndex = WORKFLOW_STEPS.findIndex(
    s => s.status === project.status
  );

  const progress = ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100;
  const currentStep = WORKFLOW_STEPS[currentStepIndex] || WORKFLOW_STEPS[0];
  const isLastStep = currentStepIndex === WORKFLOW_STEPS.length - 1;
  const isProjectApproved = project.status === 'active' || project.status === 'funded';
  const isProjectRejected = project.status === 'rejected';

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const handleMoveToReview = async () => {
    if (!stepNotes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please add notes about your initial review before proceeding',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Move project from 'submitted' to 'under_review'
      const updatedProject = await projectApi.updateDueDiligence(project._id, {
        notes: stepNotes,
        status: 'in_progress',
      });

      toast({
        title: 'Moved to Under Review',
        description: 'Project is now under detailed review',
        status: 'success',
        duration: 3000,
      });

      onUpdate(updatedProject);
      setStepNotes('');
    } catch (error: any) {
      console.error('Error moving project to review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project status',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveProject = async () => {
    if (!stepNotes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please add approval notes before proceeding',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First complete due diligence if not already done
      if (project.dueDiligence?.status !== 'completed') {
        await projectApi.updateDueDiligence(project._id, {
          notes: stepNotes,
          status: 'completed',
        });
      }

      // Then approve the project
      const updatedProject = await projectApi.verifyProject(project._id, stepNotes);

      toast({
        title: 'Project Approved! ✓',
        description: 'Project is now active and ready for funding',
        status: 'success',
        duration: 5000,
      });

      onUpdate(updatedProject);
      setStepNotes('');
    } catch (error: any) {
      console.error('Error approving project:', error);
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve project',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectProject = async () => {
    if (!stepNotes.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProject = await projectApi.rejectProject(project._id, stepNotes);

      toast({
        title: 'Project Rejected',
        description: 'Project has been rejected',
        status: 'info',
        duration: 3000,
      });

      onUpdate(updatedProject);
      setStepNotes('');
    } catch (error: any) {
      console.error('Error rejecting project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject project',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which actions to show based on current status
  const showWorkflowActions = !isProjectApproved && !isProjectRejected;
  const canMoveToReview = project.status === 'submitted';
  const canApprove = project.status === 'under_review' && project.dueDiligence?.status === 'completed';
  const canReview = project.status === 'under_review';

  // Calculate due diligence progress
  const dueDiligenceProgress = project.dueDiligence?.status === 'completed' ? 100 :
                               project.dueDiligence?.status === 'in_progress' ? 50 : 0;

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <Box>
            <Heading size="md" color="purple.600">
              Approval Workflow Progress
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Track project review and approval status
            </Text>
          </Box>
          <Badge 
            colorScheme={
              isProjectApproved ? 'green' :
              isProjectRejected ? 'red' :
              project.status === 'under_review' ? 'blue' : 'orange'
            }
            fontSize="md"
            px={3}
            py={1}
          >
            {project.status.toUpperCase().replace('_', ' ')}
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Overall Progress */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="semibold">Overall Progress</Text>
              <Text fontSize="sm" fontWeight="bold" color="purple.600">
                Step {currentStepIndex + 1} of {WORKFLOW_STEPS.length}
              </Text>
            </HStack>
            <Progress 
              value={progress} 
              colorScheme={
                progress >= 80 ? 'green' : 
                progress >= 50 ? 'yellow' : 'purple'
              } 
              size="lg" 
              borderRadius="full" 
              mb={2} 
            />
            <Text fontSize="xs" color="gray.500">
              {Math.round(progress)}% complete
            </Text>
          </Box>

          {/* Due Diligence Progress (if under review) */}
          {project.status === 'under_review' && (
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold">Due Diligence Progress</Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {project.dueDiligence?.status?.toUpperCase() || 'PENDING'}
                </Text>
              </HStack>
              <Progress 
                value={dueDiligenceProgress} 
                colorScheme="blue"
                size="md" 
                borderRadius="full" 
                mb={2} 
              />
              <Text fontSize="xs" color="gray.500">
                {dueDiligenceProgress === 100 ? 'Due diligence completed - ready for approval' :
                 dueDiligenceProgress === 50 ? 'Due diligence in progress' :
                 'Due diligence not started'}
              </Text>
            </Box>
          )}

          <Divider />

          {/* Project Status Alert */}
          {isProjectApproved && (
            <Box bg="green.50" p={4} borderRadius="md" borderWidth="2px" borderColor="green.200">
              <HStack mb={2}>
                <Icon as={FiCheckCircle} color="green.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="bold" color="green.700">
                  Project Approved!
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.700">
                This project has been approved and is {project.status === 'funded' ? 'fully funded' : 'ready for funding'}.
              </Text>
              {project.verification?.verifiedAt && (
                <Text fontSize="xs" color="gray.600" mt={2}>
                  Approved on: {new Date(project.verification.verifiedAt).toLocaleDateString()}
                </Text>
              )}
            </Box>
          )}

          {isProjectRejected && (
            <Box bg="red.50" p={4} borderRadius="md" borderWidth="2px" borderColor="red.200">
              <HStack mb={2}>
                <Icon as={FiCircle} color="red.500" boxSize={6} />
                <Text fontSize="lg" fontWeight="bold" color="red.700">
                  Project Rejected
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" mb={2}>
                This project has been rejected and cannot proceed further.
              </Text>
              {project.verification?.rejectionReason && (
                <Box bg="white" p={3} borderRadius="md" mt={2}>
                  <Text fontSize="xs" fontWeight="semibold" color="gray.600">Rejection Reason:</Text>
                  <Text fontSize="sm" color="gray.800">{project.verification.rejectionReason}</Text>
                </Box>
              )}
            </Box>
          )}

          {/* Current Step Details - Only show if project is in workflow */}
          {showWorkflowActions && currentStep && (
            <Box bg="purple.50" p={4} borderRadius="md" borderWidth="2px" borderColor="purple.200">
              <HStack mb={3}>
                <Icon as={FiClock} color="purple.500" boxSize={5} />
                <Text fontWeight="bold" color="purple.700">Current Step</Text>
                <Badge colorScheme="purple">IN PROGRESS</Badge>
              </HStack>
              
              <Text fontSize="lg" fontWeight="semibold" mb={1} color="purple.800">
                {currentStep.label}
              </Text>
              <Text fontSize="sm" color="gray.700" mb={4}>
                {currentStep.description}
              </Text>

              {/* Required Actions */}
              {currentStep.requiredActions.length > 0 && (
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="semibold" mb={2} color="purple.700">
                    Required Actions:
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {currentStep.requiredActions.map((action, idx) => (
                      <HStack key={idx} fontSize="sm" align="start">
                        <Icon as={FiArrowRight} color="purple.500" mt={0.5} />
                        <Text>{action}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Due Diligence Status (if under review) */}
              {project.status === 'under_review' && project.dueDiligence && (
                <Box mb={4} p={3} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="semibold" mb={1} color="blue.700">
                    Due Diligence Status:
                  </Text>
                  <HStack>
                    <Badge colorScheme={
                      project.dueDiligence.status === 'completed' ? 'green' :
                      project.dueDiligence.status === 'in_progress' ? 'blue' : 'gray'
                    }>
                      {project.dueDiligence.status?.toUpperCase()}
                    </Badge>
                    {project.dueDiligence.status !== 'completed' && (
                      <Text fontSize="xs" color="gray.600">
                        Complete due diligence checklist before approval
                      </Text>
                    )}
                  </HStack>
                  {project.dueDiligence.notes && (
                    <Text fontSize="xs" color="gray.700" mt={2} noOfLines={2}>
                      Notes: {project.dueDiligence.notes}
                    </Text>
                  )}
                </Box>
              )}

              {/* Step Notes */}
              <Box mb={4}>
                <Text fontSize="sm" fontWeight="semibold" mb={2} color="purple.700">
                  {canMoveToReview ? 'Initial Review Notes:' : 
                   canApprove ? 'Approval Notes:' : 
                   'Review Notes:'} <Text as="span" color="red.500">*</Text>
                </Text>
                <Textarea
                  placeholder={
                    canMoveToReview ? "Add your initial review notes..." :
                    canApprove ? "Add final approval notes and summary..." :
                    "Add your review notes..."
                  }
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  rows={4}
                  size="sm"
                />
              </Box>

              {/* Action Buttons */}
              <VStack spacing={3} align="stretch">
                {canMoveToReview && (
                  <Button
                    colorScheme="purple"
                    size="sm"
                    onClick={handleMoveToReview}
                    rightIcon={<FiArrowRight />}
                    isLoading={isSubmitting}
                  >
                    Move to Detailed Review
                  </Button>
                )}

                {canApprove && (
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={handleApproveProject}
                    rightIcon={<FiCheckCircle />}
                    isLoading={isSubmitting}
                  >
                    Approve Project
                  </Button>
                )}

                {canReview && !canApprove && (
                  <Box bg="yellow.50" p={3} borderRadius="md">
                    <Text fontSize="sm" color="yellow.800">
                      ⚠️ Complete the due diligence checklist before approving this project
                    </Text>
                  </Box>
                )}

                {(canMoveToReview || canReview) && (
                  <Button
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    leftIcon={<FiAlertCircle />}
                    onClick={handleRejectProject}
                    isLoading={isSubmitting}
                  >
                    Reject Project
                  </Button>
                )}
              </VStack>
            </Box>
          )}

          <Divider />

          {/* All Steps Timeline */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={4}>Complete Workflow Timeline</Text>
            <Accordion allowMultiple defaultIndex={[currentStepIndex]}>
              {WORKFLOW_STEPS.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <AccordionItem key={step.status} border="none" mb={2}>
                    <AccordionButton
                      bg={
                        status === 'completed' ? 'green.50' :
                        status === 'current' ? 'purple.50' : 'gray.50'
                      }
                      _hover={{
                        bg: status === 'completed' ? 'green.100' :
                        status === 'current' ? 'purple.100' : 'gray.100'
                      }}
                      borderRadius="md"
                      p={4}
                    >
                      <HStack flex="1" spacing={4}>
                        <Icon
                          as={
                            status === 'completed' ? FiCheckCircle :
                            status === 'current' ? FiClock : FiCircle
                          }
                          color={
                            status === 'completed' ? 'green.500' :
                            status === 'current' ? 'purple.500' : 'gray.300'
                          }
                          boxSize={5}
                        />
                        <VStack align="start" spacing={0} flex="1">
                          <HStack>
                            <Text
                              fontWeight={status === 'current' ? 'bold' : 'medium'}
                              color={
                                status === 'completed' ? 'green.700' :
                                status === 'current' ? 'purple.700' : 'gray.600'
                              }
                            >
                              {step.label}
                            </Text>
                            {status === 'completed' && (
                              <Badge colorScheme="green" fontSize="xs">Completed</Badge>
                            )}
                            {status === 'current' && (
                              <Badge colorScheme="purple" fontSize="xs">In Progress</Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            {step.description}
                          </Text>
                        </VStack>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} bg="white">
                      {step.requiredActions.length > 0 ? (
                        <VStack align="stretch" spacing={2} pl={4}>
                          <Text fontSize="sm" fontWeight="semibold">Required Actions:</Text>
                          {step.requiredActions.map((action, idx) => (
                            <HStack key={idx} fontSize="sm">
                              <Icon as={FiArrowRight} color="purple.400" boxSize={4} />
                              <Text>{action}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.500" pl={4}>
                          Final step - project successfully completed
                        </Text>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Box>

          {/* Additional Project Info */}
          <Box bg="gray.50" p={4} borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Project Information</Text>
            <SimpleGrid columns={2} spacing={3} fontSize="sm">
              <Box>
                <Text color="gray.600">Submitted:</Text>
                <Text fontWeight="medium">
                  {project.submittedAt 
                    ? new Date(project.submittedAt).toLocaleDateString()
                    : new Date(project.createdAt).toLocaleDateString()}
                </Text>
              </Box>
              <Box>
                <Text color="gray.600">Category:</Text>
                <Text fontWeight="medium">{project.category}</Text>
              </Box>
              <Box>
                <Text color="gray.600">Department:</Text>
                <Text fontWeight="medium">{project.department || 'Not Assigned'}</Text>
              </Box>
              <Box>
                <Text color="gray.600">Funding Goal:</Text>
                <Text fontWeight="medium">${project.fundingGoal.toLocaleString()}</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}