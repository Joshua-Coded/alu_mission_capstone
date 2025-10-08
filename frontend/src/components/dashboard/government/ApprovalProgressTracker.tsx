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
  } from '@chakra-ui/react';
  import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';
  import { ApprovalStep, Project } from '@/types/government.types';
  
  interface ApprovalProgressTrackerProps {
    project: Project;
  }
  
  const APPROVAL_STEPS = [
    { step: ApprovalStep.STEP_1_INITIAL_REVIEW, label: 'Initial Review' },
    { step: ApprovalStep.STEP_2_DOCUMENTATION, label: 'Documentation Check' },
    { step: ApprovalStep.STEP_3_LAND_VERIFICATION, label: 'Land Verification' },
    { step: ApprovalStep.STEP_4_FINANCIAL_REVIEW, label: 'Financial Review' },
    { step: ApprovalStep.STEP_5_TECHNICAL_EVAL, label: 'Technical Evaluation' },
    { step: ApprovalStep.STEP_6_COMPLIANCE, label: 'Compliance Check' },
    { step: ApprovalStep.STEP_7_SITE_INSPECTION, label: 'Site Inspection' },
    { step: ApprovalStep.STEP_8_RISK_ASSESSMENT, label: 'Risk Assessment' },
    { step: ApprovalStep.STEP_9_FINAL_REVIEW, label: 'Final Review' },
    { step: ApprovalStep.STEP_10_APPROVED, label: 'Approved' },
  ];
  
  export default function ApprovalProgressTracker({ project }: ApprovalProgressTrackerProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    const currentStepIndex = APPROVAL_STEPS.findIndex(
      s => s.step === project.currentApprovalStep
    );
  
    const progress = ((currentStepIndex + 1) / APPROVAL_STEPS.length) * 100;
  
    const getStepStatus = (index: number) => {
      if (index < currentStepIndex) return 'completed';
      if (index === currentStepIndex) return 'current';
      return 'pending';
    };
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="purple.600">
            Approval Progress
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Overall Progress</Text>
                <Text fontSize="sm" fontWeight="bold" color="purple.600">
                  {Math.round(progress)}%
                </Text>
              </HStack>
              <Progress value={progress} colorScheme="purple" size="sm" borderRadius="full" />
            </Box>
  
            <VStack spacing={4} align="stretch">
              {APPROVAL_STEPS.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <HStack key={step.step} spacing={4}>
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
                    <VStack align="start" spacing={0} flex={1}>
                      <Text
                        fontWeight={status === 'current' ? 'bold' : 'medium'}
                        color={
                          status === 'completed' ? 'green.600' :
                          status === 'current' ? 'purple.600' : 'gray.500'
                        }
                      >
                        {step.label}
                      </Text>
                      {status === 'current' && (
                        <Text fontSize="xs" color="purple.500">In Progress</Text>
                      )}
                      {status === 'completed' && (
                        <Text fontSize="xs" color="green.500">Completed</Text>
                      )}
                    </VStack>
                  </HStack>
                );
              })}
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    );
  }