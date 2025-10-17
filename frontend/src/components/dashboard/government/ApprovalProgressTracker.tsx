import { FiCheckCircle, FiCircle, FiClock, FiXCircle } from "react-icons/fi";
import { Project, ProjectStatus } from "@/lib/projectApi";

// ============================================
// FILE: components/government/ApprovalProgressTracker.tsx
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
  Badge,
} from '@chakra-ui/react';

interface ApprovalProgressTrackerProps {
  project: Project;
}

// Define approval steps based on actual project status and due diligence
const getApprovalSteps = (project: Project) => {
  const baseSteps = [
    { 
      id: 'submission',
      label: 'Project Submission',
      status: 'completed', // Always completed if project exists
      description: 'Farmer submitted project'
    },
    { 
      id: 'initial_review',
      label: 'Initial Review',
      status: project.status === 'submitted' ? 'current' : 
              ['under_review', 'active', 'funded', 'closed'].includes(project.status) ? 'completed' : 'pending',
      description: 'Basic eligibility check'
    },
    { 
      id: 'documentation',
      label: 'Documentation Check',
      status: project.status === 'under_review' && project.dueDiligence?.status === 'pending' ? 'current' :
              project.status === 'under_review' && project.dueDiligence?.status === 'in_progress' ? 'completed' :
              ['active', 'funded', 'closed'].includes(project.status) ? 'completed' : 'pending',
      description: 'Verify documents'
    },
    { 
      id: 'due_diligence',
      label: 'Due Diligence',
      status: project.status === 'under_review' && project.dueDiligence?.status === 'in_progress' ? 'current' :
              project.dueDiligence?.status === 'completed' ? 'completed' : 'pending',
      description: 'Complete checklist'
    },
    { 
      id: 'final_review',
      label: 'Final Review',
      status: project.status === 'under_review' && project.dueDiligence?.status === 'completed' ? 'current' :
              ['active', 'funded', 'closed'].includes(project.status) ? 'completed' : 'pending',
      description: 'Final approval decision'
    },
    { 
      id: 'approved',
      label: 'Approved',
      status: ['active', 'funded', 'closed'].includes(project.status) ? 'completed' : 'pending',
      description: 'Ready for funding'
    },
  ];

  // If project is rejected, mark all steps after submission as failed
  if (project.status === 'rejected') {
    return baseSteps.map((step, index) => ({
      ...step,
      status: index === 0 ? 'completed' : 'failed'
    }));
  }

  return baseSteps;
};

export default function ApprovalProgressTracker({ project }: ApprovalProgressTrackerProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const approvalSteps = getApprovalSteps(project);
  
  // Calculate progress
  const completedSteps = approvalSteps.filter(s => s.status === 'completed').length;
  const totalSteps = approvalSteps.length;
  const progress = (completedSteps / totalSteps) * 100;
  
  // Find current step
  const currentStep = approvalSteps.find(s => s.status === 'current');
  const isRejected = project.status === 'rejected';
  const isApproved = ['active', 'funded', 'closed'].includes(project.status);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return FiCheckCircle;
      case 'current': return FiClock;
      case 'failed': return FiXCircle;
      default: return FiCircle;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green.500';
      case 'current': return 'purple.500';
      case 'failed': return 'red.500';
      default: return 'gray.300';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green.600';
      case 'current': return 'purple.600';
      case 'failed': return 'red.600';
      default: return 'gray.500';
    }
  };

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md" color="purple.600">
            Approval Progress
          </Heading>
          <Badge 
            colorScheme={
              isApproved ? 'green' :
              isRejected ? 'red' :
              currentStep ? 'purple' : 'gray'
            }
            fontSize="sm"
          >
            {isApproved ? 'APPROVED' :
             isRejected ? 'REJECTED' :
             project.status.toUpperCase().replace('_', ' ')}
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Overall Progress Bar */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">Overall Progress</Text>
              <Text fontSize="sm" fontWeight="bold" color={isRejected ? 'red.600' : 'purple.600'}>
                {completedSteps}/{totalSteps} Steps
              </Text>
            </HStack>
            <Progress 
              value={progress} 
              colorScheme={isRejected ? 'red' : isApproved ? 'green' : 'purple'} 
              size="sm" 
              borderRadius="full" 
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {Math.round(progress)}% complete
            </Text>
          </Box>

          {/* Current Step Highlight */}
          {currentStep && !isRejected && (
            <Box bg="purple.50" p={3} borderRadius="md" borderWidth="1px" borderColor="purple.200">
              <HStack mb={1}>
                <Icon as={FiClock} color="purple.500" />
                <Text fontSize="sm" fontWeight="bold" color="purple.700">
                  Current Step
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.700">
                {currentStep.label}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {currentStep.description}
              </Text>
            </Box>
          )}

          {/* Rejection Alert */}
          {isRejected && (
            <Box bg="red.50" p={3} borderRadius="md" borderWidth="1px" borderColor="red.200">
              <HStack mb={1}>
                <Icon as={FiXCircle} color="red.500" />
                <Text fontSize="sm" fontWeight="bold" color="red.700">
                  Project Rejected
                </Text>
              </HStack>
              {project.verification?.rejectionReason && (
                <Text fontSize="sm" color="gray.700" mt={2}>
                  Reason: {project.verification.rejectionReason}
                </Text>
              )}
            </Box>
          )}

          {/* Approval Alert */}
          {isApproved && (
            <Box bg="green.50" p={3} borderRadius="md" borderWidth="1px" borderColor="green.200">
              <HStack mb={1}>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontSize="sm" fontWeight="bold" color="green.700">
                  Project Approved!
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.600">
                {project.verification?.verifiedAt && 
                  `Approved on ${new Date(project.verification.verifiedAt).toLocaleDateString()}`
                }
              </Text>
            </Box>
          )}

          {/* Step List */}
          <VStack spacing={3} align="stretch">
            {approvalSteps.map((step, index) => (
              <HStack key={step.id} spacing={4}>
                <Icon
                  as={getStepIcon(step.status)}
                  color={getStepColor(step.status)}
                  boxSize={5}
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text
                    fontWeight={step.status === 'current' ? 'bold' : 'medium'}
                    color={getTextColor(step.status)}
                    fontSize="sm"
                  >
                    {step.label}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {step.description}
                  </Text>
                  {step.status === 'current' && (
                    <Badge colorScheme="purple" fontSize="xs" mt={1}>
                      In Progress
                    </Badge>
                  )}
                  {step.status === 'completed' && (
                    <Badge colorScheme="green" fontSize="xs" mt={1}>
                      Completed
                    </Badge>
                  )}
                  {step.status === 'failed' && (
                    <Badge colorScheme="red" fontSize="xs" mt={1}>
                      Failed
                    </Badge>
                  )}
                </VStack>
              </HStack>
            ))}
          </VStack>

          {/* Additional Info */}
          {project.dueDiligence?.status && (
            <Box bg="gray.50" p={3} borderRadius="md">
              <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1}>
                Due Diligence Status:
              </Text>
              <HStack>
                <Badge 
                  colorScheme={
                    project.dueDiligence.status === 'completed' ? 'green' :
                    project.dueDiligence.status === 'in_progress' ? 'blue' : 'gray'
                  }
                  fontSize="xs"
                >
                  {project.dueDiligence.status.toUpperCase()}
                </Badge>
                {project.dueDiligence.assignedTo && (
                  <Text fontSize="xs" color="gray.600">
                    Assigned to: {
                      typeof project.dueDiligence.assignedTo === 'object'
                        ? `${project.dueDiligence.assignedTo.firstName} ${project.dueDiligence.assignedTo.lastName}`
                        : project.dueDiligence.assignedTo
                    }
                  </Text>
                )}
              </HStack>
            </Box>
          )}

          {/* Timeline */}
          <Box bg="gray.50" p={3} borderRadius="md">
            <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={2}>
              Timeline
            </Text>
            <VStack align="stretch" spacing={1} fontSize="xs" color="gray.600">
              <HStack justify="space-between">
                <Text>Submitted:</Text>
                <Text fontWeight="medium">
                  {project.submittedAt 
                    ? new Date(project.submittedAt).toLocaleDateString()
                    : new Date(project.createdAt).toLocaleDateString()
                  }
                </Text>
              </HStack>
              {project.dueDiligence?.startedAt && (
                <HStack justify="space-between">
                  <Text>Review Started:</Text>
                  <Text fontWeight="medium">
                    {new Date(project.dueDiligence.startedAt).toLocaleDateString()}
                  </Text>
                </HStack>
              )}
              {project.verification?.verifiedAt && (
                <HStack justify="space-between">
                  <Text>Approved:</Text>
                  <Text fontWeight="medium" color="green.600">
                    {new Date(project.verification.verifiedAt).toLocaleDateString()}
                  </Text>
                </HStack>
              )}
              {project.updatedAt && (
                <HStack justify="space-between">
                  <Text>Last Updated:</Text>
                  <Text fontWeight="medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}