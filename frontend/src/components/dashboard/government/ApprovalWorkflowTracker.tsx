// ============================================
// FILE: components/government/ApprovalWorkflowTracker.tsx
// Enhanced with full step-by-step verification workflow
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
  import { FiCheckCircle, FiCircle, FiClock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
  import { ApprovalStep, Project } from '@/types/government.types';
  import { useState } from 'react';
  
  interface ApprovalWorkflowTrackerProps {
    project: Project;
    onMoveToNextStep: () => void;
  }
  
  const WORKFLOW_STEPS = [
    { 
      step: ApprovalStep.STEP_1_INITIAL_REVIEW, 
      label: 'Step 1: Initial Review', 
      description: 'Review basic project information and eligibility',
      requiredActions: [
        'Verify farmer identity and contact information',
        'Check project category and type',
        'Assess initial feasibility',
        'Confirm all required forms are submitted'
      ]
    },
    { 
      step: ApprovalStep.STEP_2_DOCUMENTATION, 
      label: 'Step 2: Documentation Check', 
      description: 'Verify all required documents are submitted and valid',
      requiredActions: [
        'Check business plan completeness',
        'Verify document authenticity',
        'Assess document quality and clarity',
        'Confirm all supporting documents are present'
      ]
    },
    { 
      step: ApprovalStep.STEP_3_LAND_VERIFICATION, 
      label: 'Step 3: Land Verification', 
      description: 'Verify land ownership and certificates',
      requiredActions: [
        'Verify land title documents',
        'Check land size and boundaries',
        'Confirm legal ownership',
        'Validate land use permits'
      ]
    },
    { 
      step: ApprovalStep.STEP_4_FINANCIAL_REVIEW, 
      label: 'Step 4: Financial Assessment', 
      description: 'Review financial viability and ROI projections',
      requiredActions: [
        'Analyze budget breakdown',
        'Review ROI projections',
        'Assess financial risk',
        'Verify funding requirements'
      ]
    },
    { 
      step: ApprovalStep.STEP_5_TECHNICAL_EVAL, 
      label: 'Step 5: Technical Evaluation', 
      description: 'Evaluate technical feasibility and approach',
      requiredActions: [
        'Review technical plan and methodology',
        'Assess equipment and technology needs',
        'Evaluate production capacity',
        'Verify technical expertise'
      ]
    },
    { 
      step: ApprovalStep.STEP_6_COMPLIANCE, 
      label: 'Step 6: Compliance Check', 
      description: 'Ensure regulatory and policy compliance',
      requiredActions: [
        'Check agricultural regulations compliance',
        'Verify required permits and licenses',
        'Assess environmental compliance',
        'Review safety standards adherence'
      ]
    },
    { 
      step: ApprovalStep.STEP_7_SITE_INSPECTION, 
      label: 'Step 7: Site Inspection', 
      description: 'Physical inspection of project site',
      requiredActions: [
        'Schedule site visit with farmer',
        'Conduct physical inspection',
        'Document site conditions',
        'Take photographic evidence'
      ]
    },
    { 
      step: ApprovalStep.STEP_8_RISK_ASSESSMENT, 
      label: 'Step 8: Risk Assessment', 
      description: 'Comprehensive risk analysis',
      requiredActions: [
        'Identify potential risks',
        'Assess risk severity and likelihood',
        'Review mitigation strategies',
        'Calculate overall risk score'
      ]
    },
    { 
      step: ApprovalStep.STEP_9_FINAL_REVIEW, 
      label: 'Step 9: Final Review', 
      description: 'Final approval decision by senior officials',
      requiredActions: [
        'Review all previous findings',
        'Consolidate recommendations',
        'Make final approval decision',
        'Prepare approval documentation'
      ]
    },
    { 
      step: ApprovalStep.STEP_10_APPROVED, 
      label: 'Step 10: Approved', 
      description: 'Project approved and ready for funding',
      requiredActions: []
    },
  ];
  
  export default function ApprovalWorkflowTracker({ project, onMoveToNextStep }: ApprovalWorkflowTrackerProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const toast = useToast();
    const [stepNotes, setStepNotes] = useState('');
  
    const currentStepIndex = WORKFLOW_STEPS.findIndex(
      s => s.step === project.currentApprovalStep
    );
  
    const progress = ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100;
    const currentStep = WORKFLOW_STEPS[currentStepIndex];
    const isLastStep = currentStepIndex === WORKFLOW_STEPS.length - 1;
  
    const getStepStatus = (index: number) => {
      if (index < currentStepIndex) return 'completed';
      if (index === currentStepIndex) return 'current';
      return 'pending';
    };
  
    const handleCompleteStep = () => {
      if (!stepNotes.trim()) {
        toast({
          title: 'Notes Required',
          description: 'Please add notes about your review before proceeding',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      onMoveToNextStep();
      setStepNotes('');
    };
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="purple.600">
            Approval Workflow Progress
          </Heading>
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
              <Progress value={progress} colorScheme="purple" size="lg" borderRadius="full" mb={2} />
              <Text fontSize="xs" color="gray.500">
                {Math.round(progress)}% complete
              </Text>
            </Box>
  
            <Divider />
  
            {/* Current Step Details */}
            {!isLastStep && currentStep && (
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
  
                {/* Step Notes */}
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="semibold" mb={2} color="purple.700">
                    Review Notes: <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Textarea
                    placeholder="Add your review notes and findings for this step..."
                    value={stepNotes}
                    onChange={(e) => setStepNotes(e.target.value)}
                    rows={4}
                    size="sm"
                  />
                </Box>
  
                {/* Action Buttons */}
                <HStack spacing={3}>
                  <Button
                    colorScheme="purple"
                    size="sm"
                    onClick={handleCompleteStep}
                    rightIcon={<FiCheckCircle />}
                    flex="1"
                  >
                    Complete & Move to Next Step
                  </Button>
                  <Button
                    colorScheme="orange"
                    variant="outline"
                    size="sm"
                    leftIcon={<FiAlertCircle />}
                  >
                    Flag Issue
                  </Button>
                </HStack>
              </Box>
            )}
  
            {/* Approved State */}
            {isLastStep && (
              <Box bg="green.50" p={4} borderRadius="md" borderWidth="2px" borderColor="green.200">
                <HStack mb={2}>
                  <Icon as={FiCheckCircle} color="green.500" boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold" color="green.700">
                    Project Approved!
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  This project has completed all approval steps and is ready for funding.
                </Text>
              </Box>
            )}
  
            <Divider />
  
            {/* All Steps Timeline */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={4}>Complete Workflow Timeline</Text>
              <Accordion allowMultiple>
                {WORKFLOW_STEPS.map((step, index) => {
                  const status = getStepStatus(index);
                  return (
                    <AccordionItem key={step.step} border="none" mb={2}>
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
                        {step.requiredActions.length > 0 && (
                          <VStack align="stretch" spacing={2} pl={4}>
                            <Text fontSize="sm" fontWeight="semibold">Required Actions:</Text>
                            {step.requiredActions.map((action, idx) => (
                              <HStack key={idx} fontSize="sm">
                                <Icon as={FiArrowRight} color="purple.400" boxSize={4} />
                                <Text>{action}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        )}
                        {step.requiredActions.length === 0 && (
                          <Text fontSize="sm" color="gray.500" pl={4}>
                            Final step - no additional actions required
                          </Text>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    );
  }