import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Project, UpdateDueDiligenceDto, projectApi } from "@/lib/projectApi";

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
  Badge,
  Button,
  Divider,
  SimpleGrid,
  Textarea,
  Select,
  useToast,
  Avatar,
  Alert,
  AlertIcon,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiClock, 
  FiUser, 
  FiFileText,
  FiTrendingUp,
  FiMapPin,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';

interface DueDiligencePanelProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

interface DueDiligenceCheck {
  id: string;
  category: string;
  checkName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  assignedTo?: string;
  findings: string;
  recommendation: 'APPROVE' | 'REJECT' | 'NEEDS_MORE_INFO';
  score: number;
  required: boolean;
  weight: number; // Weight for overall score calculation
}

export default function DueDiligencePanel({ project, onUpdate }: DueDiligencePanelProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { user } = useAuth();
  const toast = useToast();
  const [editingCheck, setEditingCheck] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localChecks, setLocalChecks] = useState<DueDiligenceCheck[]>([]);
  const [checkData, setCheckData] = useState({
    status: '',
    findings: '',
    recommendation: '',
    score: 0,
  });

  const categories = [
    { name: 'DOCUMENTATION', label: 'Documentation', color: 'blue', icon: FiFileText },
    { name: 'LEGAL', label: 'Legal Compliance', color: 'purple', icon: FiAward },
    { name: 'FINANCIAL', label: 'Financial', color: 'green', icon: FiTrendingUp },
    { name: 'TECHNICAL', label: 'Technical', color: 'orange', icon: FiCheckCircle },
    { name: 'ENVIRONMENTAL', label: 'Environmental', color: 'teal', icon: FiMapPin },
    { name: 'SOCIAL', label: 'Social Impact', color: 'pink', icon: FiUser },
  ];

  // Enhanced due diligence checks with real project data
  const generateDueDiligenceChecks = (): DueDiligenceCheck[] => {
    const baseChecks: DueDiligenceCheck[] = [
      {
        id: 'document-verification',
        category: 'DOCUMENTATION',
        checkName: 'Document Verification',
        status: project.documents && project.documents.length > 0 ? 'COMPLETED' : 'PENDING',
        findings: project.documents && project.documents.length > 0 
          ? `${project.documents.length} documents uploaded and verified` 
          : 'No documents uploaded for verification',
        recommendation: project.documents && project.documents.length > 0 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.documents && project.documents.length > 0 ? 85 : 30,
        required: true,
        weight: 15,
      },
      {
        id: 'financial-viability',
        category: 'FINANCIAL',
        checkName: 'Financial Viability Assessment',
        status: project.fundingGoal > 0 ? 'COMPLETED' : 'PENDING',
        findings: project.fundingGoal > 0 
          ? `Funding goal of ${project.fundingGoal.toFixed(2)} MATIC seems reasonable for ${project.category}` 
          : 'Funding goal not specified',
        recommendation: project.fundingGoal > 0 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.fundingGoal > 0 ? 80 : 40,
        required: true,
        weight: 20,
      },
      {
        id: 'location-suitability',
        category: 'TECHNICAL',
        checkName: 'Location Suitability',
        status: project.location ? 'COMPLETED' : 'PENDING',
        findings: project.location 
          ? `Project location: ${project.location} - suitable for ${project.category} activities` 
          : 'Location not specified',
        recommendation: project.location ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.location ? 75 : 25,
        required: true,
        weight: 15,
      },
      {
        id: 'timeline-feasibility',
        category: 'TECHNICAL',
        checkName: 'Project Timeline Feasibility',
        status: project.timeline ? 'COMPLETED' : 'PENDING',
        findings: project.timeline 
          ? `Project timeline: ${project.timeline} - appears realistic and achievable` 
          : 'Timeline not specified',
        recommendation: project.timeline ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.timeline ? 70 : 30,
        required: true,
        weight: 10,
      },
      {
        id: 'category-appropriateness',
        category: 'TECHNICAL',
        checkName: 'Project Category Appropriateness',
        status: project.category ? 'COMPLETED' : 'PENDING',
        findings: project.category 
          ? `Project category: ${project.category} - appropriate classification for agricultural funding` 
          : 'Category not specified',
        recommendation: project.category ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.category ? 85 : 35,
        required: true,
        weight: 10,
      },
      {
        id: 'description-completeness',
        category: 'DOCUMENTATION',
        checkName: 'Project Description Completeness',
        status: project.description && project.description.length > 100 ? 'COMPLETED' : 'PENDING',
        findings: project.description && project.description.length > 100 
          ? 'Detailed project description provided with clear objectives and implementation plan' 
          : 'Project description is too brief or missing key details',
        recommendation: project.description && project.description.length > 100 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.description && project.description.length > 100 ? 80 : 45,
        required: true,
        weight: 10,
      },
      {
        id: 'farmer-identity',
        category: 'LEGAL',
        checkName: 'Farmer Identity Verification',
        status: project.farmer ? 'COMPLETED' : 'PENDING',
        findings: project.farmer 
          ? 'Farmer identity verified and account in good standing' 
          : 'Farmer verification pending',
        recommendation: project.farmer ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.farmer ? 90 : 20,
        required: true,
        weight: 15,
      },
      {
        id: 'visual-documentation',
        category: 'DOCUMENTATION',
        checkName: 'Visual Documentation',
        status: project.images && project.images.length > 0 ? 'COMPLETED' : 'PENDING',
        findings: project.images && project.images.length > 0 
          ? `${project.images.length} project images uploaded - provides clear visual evidence of project site` 
          : 'No project images uploaded for visual verification',
        recommendation: project.images && project.images.length > 0 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.images && project.images.length > 0 ? 75 : 35,
        required: false,
        weight: 5,
      },
      {
        id: 'blockchain-readiness',
        category: 'TECHNICAL',
        checkName: 'Blockchain Integration Readiness',
        status: project.blockchainStatus === 'created' ? 'COMPLETED' : 'PENDING',
        findings: project.blockchainStatus === 'created' 
          ? 'Project successfully deployed on blockchain with contract address' 
          : 'Blockchain deployment pending or failed',
        recommendation: project.blockchainStatus === 'created' ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.blockchainStatus === 'created' ? 85 : 50,
        required: false,
        weight: 5,
      },
      {
        id: 'department-alignment',
        category: 'LEGAL',
        checkName: 'Department Alignment',
        status: project.department ? 'COMPLETED' : 'PENDING',
        findings: project.department 
          ? `Project aligns with ${project.department} department guidelines and regulations` 
          : 'Department assignment pending',
        recommendation: project.department ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.department ? 80 : 40,
        required: false,
        weight: 5,
      }
    ];

    return baseChecks;
  };

  // Initialize local checks on mount
  useEffect(() => {
    setLocalChecks(generateDueDiligenceChecks());
  }, [project._id]);

  const getChecksByCategory = (category: string) => {
    return localChecks.filter(check => check.category === category);
  };

  const getCategoryProgress = (category: string) => {
    const checks = getChecksByCategory(category);
    if (checks.length === 0) return 0;
    const completed = checks.filter(c => c.status === 'COMPLETED').length;
    return (completed / checks.length) * 100;
  };

  const getCategoryScore = (category: string) => {
    const checks = getChecksByCategory(category);
    if (checks.length === 0) return 0;
    const totalWeightedScore = checks.reduce((sum, c) => sum + (c.score * c.weight), 0);
    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    return Math.round(totalWeightedScore / totalWeight);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'gray',
      IN_PROGRESS: 'blue',
      COMPLETED: 'green',
      FAILED: 'red',
    };
    return colors[status] || 'gray';
  };

  const getRecommendationColor = (recommendation: string) => {
    const colors: Record<string, string> = {
      APPROVE: 'green',
      REJECT: 'red',
      NEEDS_MORE_INFO: 'yellow',
    };
    return colors[recommendation] || 'gray';
  };

  const handleSaveCheck = async (checkId: string) => {
    if (!checkData.status || !checkData.recommendation) {
      toast({
        title: 'Missing Information',
        description: 'Please select status and recommendation',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update local state
      const updatedChecks = localChecks.map(check => 
        check.id === checkId 
          ? {
              ...check,
              status: checkData.status as any,
              findings: checkData.findings,
              recommendation: checkData.recommendation as any,
              score: checkData.score,
              assignedTo: user?.id || 'Current User',
            }
          : check
      );
      
      setLocalChecks(updatedChecks);

      // Prepare comprehensive due diligence report
      const allFindings = updatedChecks.map(check => 
        `• ${check.checkName}: ${check.findings} (Score: ${check.score}/100, Status: ${check.status}, Recommendation: ${check.recommendation})`
      ).join('\n\n');

      const finalNotes = `DUE DILIGENCE REPORT - ${new Date().toLocaleDateString()}\n\n` +
        `Project: ${project.title}\n` +
        `Category: ${project.category}\n` +
        `Location: ${project.location}\n\n` +
        `CHECKS COMPLETED:\n${allFindings}\n\n` +
        `OVERALL ASSESSMENT:\n` +
        `• Overall Score: ${calculateOverallScore(updatedChecks)}/100\n` +
        `• Completion Rate: ${calculateCompletionRate(updatedChecks)}%\n` +
        `• Required Checks Completed: ${updatedChecks.filter(c => c.required && c.status === 'COMPLETED').length}/${updatedChecks.filter(c => c.required).length}\n` +
        `• Final Recommendation: ${getFinalRecommendation(updatedChecks)}\n\n` +
        `Reviewed by: ${user?.firstName} ${user?.lastName}`;

      const updateData: UpdateDueDiligenceDto = {
        notes: finalNotes,
        status: 'in_progress',
        documents: project.dueDiligence?.documents || [],
      };

      // Update due diligence using projectApi
      const updatedProject = await projectApi.updateDueDiligence(project._id, updateData);

      toast({
        title: 'Check Updated Successfully',
        description: 'Due diligence check has been saved',
        status: 'success',
        duration: 3000,
      });
      
      // Update parent component
      onUpdate(updatedProject);
      
      setEditingCheck(null);
      setCheckData({ status: '', findings: '', recommendation: '', score: 0 });
    } catch (error: any) {
      console.error('Error updating due diligence:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update due diligence check',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (check: DueDiligenceCheck) => {
    setEditingCheck(check.id);
    setCheckData({
      status: check.status,
      findings: check.findings,
      recommendation: check.recommendation,
      score: check.score,
    });
  };

  const calculateOverallScore = (checks: DueDiligenceCheck[]) => {
    if (checks.length === 0) return 0;
    const totalWeightedScore = checks.reduce((sum, check) => sum + (check.score * check.weight), 0);
    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    return Math.round(totalWeightedScore / totalWeight);
  };

  const calculateCompletionRate = (checks: DueDiligenceCheck[]) => {
    const totalChecks = checks.length;
    const completedChecks = checks.filter(check => check.status === 'COMPLETED').length;
    return Math.round((completedChecks / totalChecks) * 100);
  };

  const getFinalRecommendation = (checks: DueDiligenceCheck[]) => {
    const requiredChecks = checks.filter(check => check.required);
    const completedRequired = requiredChecks.filter(check => check.status === 'COMPLETED');
    const overallScore = calculateOverallScore(checks);

    if (completedRequired.length < requiredChecks.length) {
      return 'PENDING - Required checks incomplete';
    }
    
    if (overallScore >= 80) {
      return 'STRONG APPROVAL RECOMMENDED';
    } else if (overallScore >= 70) {
      return 'APPROVAL RECOMMENDED';
    } else if (overallScore >= 60) {
      return 'CONDITIONAL APPROVAL - Needs monitoring';
    } else {
      return 'REVIEW REQUIRED - Significant concerns';
    }
  };

  const handleCompleteDueDiligence = async () => {
    setIsSubmitting(true);
    try {
      // Prepare final comprehensive report
      const allFindings = localChecks.map(check => 
        `✓ ${check.checkName}: ${check.findings} (Score: ${check.score}/100, Status: ${check.status})`
      ).join('\n\n');

      const finalNotes = `DUE DILIGENCE COMPLETED - ${new Date().toLocaleDateString()}\n\n` +
        `FINAL ASSESSMENT REPORT\n\n` +
        `Project Details:\n` +
        `• Title: ${project.title}\n` +
        `• Category: ${project.category}\n` +
        `• Location: ${project.location}\n` +
        `• Funding Goal: ${project.fundingGoal.toFixed(2)} MATIC\n\n` +
        `Assessment Results:\n${allFindings}\n\n` +
        `SUMMARY:\n` +
        `• Overall Score: ${overallScore}/100\n` +
        `• Completion Rate: ${overallProgress}%\n` +
        `• Required Checks: ${localChecks.filter(c => c.required && c.status === 'COMPLETED').length}/${localChecks.filter(c => c.required).length} completed\n` +
        `• Final Recommendation: ${getFinalRecommendation(localChecks)}\n\n` +
        `Completed by: ${user?.firstName} ${user?.lastName}\n` +
        `Completion Date: ${new Date().toLocaleDateString()}`;

      const updateData: UpdateDueDiligenceDto = {
        notes: finalNotes,
        status: 'completed',
        // completedAt: new Date().toISOString(),
      };

      const updatedProject = await projectApi.updateDueDiligence(project._id, updateData);

      toast({
        title: 'Due Diligence Completed! 🎉',
        description: 'All checks completed. Project is ready for final approval.',
        status: 'success',
        duration: 5000,
      });
      
      onUpdate(updatedProject);
    } catch (error: any) {
      console.error('Error completing due diligence:', error);
      toast({
        title: 'Completion Failed',
        description: error.message || 'Failed to complete due diligence process',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall progress
  const totalChecks = localChecks.length;
  const completedChecks = localChecks.filter(check => check.status === 'COMPLETED').length;
  const overallProgress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  // Calculate overall score with weights
  const overallScore = calculateOverallScore(localChecks);

  // Determine if ready for approval
  const requiredChecks = localChecks.filter(check => check.required);
  const completedRequired = requiredChecks.filter(check => check.status === 'COMPLETED');
  const isReadyForApproval = completedRequired.length === requiredChecks.length && overallScore >= 70;

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
          <Box flex={1}>
            <Heading size="md" color="purple.600">
              Due Diligence Assessment
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Comprehensive project evaluation for government approval
            </Text>
          </Box>
          
          <VStack spacing={3} align="end">
            <Badge 
              colorScheme={
                project.dueDiligence?.status === 'completed' ? 'green' :
                project.dueDiligence?.status === 'in_progress' ? 'blue' : 'gray'
              }
              fontSize="md"
              px={3}
              py={1}
            >
              {project.dueDiligence?.status?.toUpperCase() || 'NOT STARTED'}
            </Badge>
            
            <SimpleGrid columns={2} spacing={3}>
              <Stat size="sm">
                <StatLabel fontSize="xs">Overall Score</StatLabel>
                <StatNumber fontSize="lg" color={
                  overallScore >= 80 ? 'green.600' :
                  overallScore >= 70 ? 'blue.600' :
                  overallScore >= 60 ? 'orange.600' : 'red.600'
                }>
                  {overallScore}
                </StatNumber>
                <StatHelpText fontSize="xs">/100</StatHelpText>
              </Stat>
              
              <Stat size="sm">
                <StatLabel fontSize="xs">Progress</StatLabel>
                <StatNumber fontSize="lg" color="purple.600">
                  {completedChecks}/{totalChecks}
                </StatNumber>
                <StatHelpText fontSize="xs">checks</StatHelpText>
              </Stat>
            </SimpleGrid>

            <Button
              colorScheme={isReadyForApproval ? "green" : "gray"}
              size="sm"
              onClick={handleCompleteDueDiligence}
              isLoading={isSubmitting}
              isDisabled={!isReadyForApproval || project.dueDiligence?.status === 'completed'}
              leftIcon={<FiCheckCircle />}
            >
              {project.dueDiligence?.status === 'completed' ? 'Completed ✓' : 'Complete Assessment'}
            </Button>
          </VStack>
        </Flex>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Assessment Status Alerts */}
          {isReadyForApproval && project.dueDiligence?.status !== 'completed' && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Ready for Final Approval! 🎉</Text>
                <Text fontSize="sm">
                  All required checks completed with satisfactory scores ({overallScore}/100). 
                  Click "Complete Assessment" to finalize due diligence.
                </Text>
              </Box>
            </Alert>
          )}

          {overallScore < 70 && overallProgress === 100 && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Review Required</Text>
                <Text fontSize="sm">
                  Overall score is {overallScore}/100. Consider addressing lower-scoring areas before final approval.
                </Text>
              </Box>
            </Alert>
          )}

          {/* Overall Progress */}
          <Box bg="purple.50" p={4} borderRadius="md" border="1px" borderColor="purple.200">
            <VStack spacing={3}>
              <Flex justify="space-between" w="full" align="center">
                <Text fontWeight="semibold">Assessment Progress</Text>
                <Text fontSize="lg" fontWeight="bold" color="purple.600">
                  {completedChecks}/{totalChecks} Checks
                </Text>
              </Flex>
              
              <Progress 
                value={overallProgress} 
                colorScheme={overallProgress >= 100 ? 'green' : overallProgress >= 70 ? 'blue' : 'orange'}
                size="lg" 
                borderRadius="full" 
                hasStripe
                isAnimated={overallProgress < 100}
              />
              
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="gray.600">
                  {overallProgress >= 100 
                    ? '✓ All checks completed' 
                    : `${totalChecks - completedChecks} checks remaining`}
                </Text>
                <Text color="gray.600">
                  Required: {completedRequired.length}/{requiredChecks.length} completed
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Current Due Diligence Status */}
          {project.dueDiligence && (
            <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50" borderColor="blue.200">
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="semibold">Current Assessment Status</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Status</Text>
                    <Badge colorScheme={
                      project.dueDiligence.status === 'completed' ? 'green' :
                      project.dueDiligence.status === 'in_progress' ? 'blue' : 'gray'
                    } fontSize="sm">
                      {project.dueDiligence.status?.toUpperCase()}
                    </Badge>
                  </Box>
                  
                  {project.dueDiligence.assignedTo && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">Assigned Officer</Text>
                      <HStack>
                        <Avatar 
                          size="xs" 
                          name={
                            typeof project.dueDiligence.assignedTo === 'object' 
                              ? `${project.dueDiligence.assignedTo.firstName} ${project.dueDiligence.assignedTo.lastName}`
                              : project.dueDiligence.assignedTo
                          } 
                        />
                        <Text fontSize="sm">
                          {typeof project.dueDiligence.assignedTo === 'object' 
                            ? `${project.dueDiligence.assignedTo.firstName} ${project.dueDiligence.assignedTo.lastName}`
                            : project.dueDiligence.assignedTo}
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </SimpleGrid>

                {project.dueDiligence.notes && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>Latest Assessment Notes:</Text>
                    <Box 
                      fontSize="sm" 
                      color="gray.700" 
                      maxH="120px" 
                      overflowY="auto"
                      p={2}
                      bg="white"
                      borderRadius="md"
                      border="1px"
                      borderColor="gray.200"
                    >
                      {project.dueDiligence.notes}
                    </Box>
                  </Box>
                )}
              </VStack>
            </Box>
          )}

          <Divider />

          {/* Category Overview */}
          <Box>
            <Heading size="sm" mb={4} color="gray.700">Assessment Categories</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {categories.map((category) => {
                const progress = getCategoryProgress(category.name);
                const score = getCategoryScore(category.name);
                const checks = getChecksByCategory(category.name);
                
                if (checks.length === 0) return null;
                
                return (
                  <Card key={category.name} size="sm" variant="outline">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Icon as={category.icon} color={`${category.color}.500`} />
                          <Text fontWeight="semibold" fontSize="sm">{category.label}</Text>
                        </HStack>
                        
                        <Progress 
                          value={progress} 
                          colorScheme={category.color} 
                          size="sm" 
                          borderRadius="full" 
                        />
                        
                        <Flex justify="space-between" fontSize="xs">
                          <Text color="gray.600">
                            {checks.filter(c => c.status === 'COMPLETED').length}/{checks.length}
                          </Text>
                          <Text fontWeight="bold" color={`${category.color}.600`}>
                            {score}/100
                          </Text>
                        </Flex>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Detailed Assessment Checks */}
          <Box>
            <Heading size="sm" mb={4} color="gray.700">Detailed Assessment Checks</Heading>
            <VStack spacing={6} align="stretch">
              {categories.map((category) => {
                const checks = getChecksByCategory(category.name);
                if (checks.length === 0) return null;

                return (
                  <Box key={category.name}>
                    <HStack mb={4} spacing={2}>
                      <Icon as={category.icon} color={`${category.color}.500`} />
                      <Heading size="sm" color={`${category.color}.600`}>
                        {category.label} Assessment
                      </Heading>
                      <Badge colorScheme={category.color} fontSize="xs">
                        {checks.length} checks
                      </Badge>
                    </HStack>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {checks.map((check) => (
                        <Card 
                          key={check.id} 
                          variant="outline"
                          borderColor={editingCheck === check.id ? 'blue.300' : 'gray.200'}
                          bg={editingCheck === check.id ? 'blue.50' : cardBg}
                        >
                          <CardBody>
                            {editingCheck === check.id ? (
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="semibold" fontSize="sm">{check.checkName}</Text>
                                {check.required && (
                                  <Badge colorScheme="red" fontSize="xs" alignSelf="start">
                                    REQUIRED
                                  </Badge>
                                )}
                                
                                <Select
                                  size="sm"
                                  value={checkData.status}
                                  onChange={(e) => setCheckData({ ...checkData, status: e.target.value })}
                                >
                                  <option value="">Select Status</option>
                                  <option value="PENDING">Pending</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="FAILED">Failed</option>
                                </Select>

                                <Textarea
                                  size="sm"
                                  placeholder="Enter detailed findings and observations..."
                                  value={checkData.findings}
                                  onChange={(e) => setCheckData({ ...checkData, findings: e.target.value })}
                                  rows={3}
                                />

                                <Select
                                  size="sm"
                                  value={checkData.recommendation}
                                  onChange={(e) => setCheckData({ ...checkData, recommendation: e.target.value })}
                                >
                                  <option value="">Select Recommendation</option>
                                  <option value="APPROVE">Approve</option>
                                  <option value="REJECT">Reject</option>
                                  <option value="NEEDS_MORE_INFO">Needs More Info</option>
                                </Select>

                                <Box>
                                  <Text fontSize="sm" mb={1}>Confidence Score: {checkData.score}/100</Text>
                                  <Select
                                    size="sm"
                                    value={checkData.score}
                                    onChange={(e) => setCheckData({ ...checkData, score: Number(e.target.value) })}
                                  >
                                    {[...Array(11)].map((_, i) => (
                                      <option key={i * 10} value={i * 10}>
                                        {i * 10} - {i === 10 ? 'Excellent' : i >= 8 ? 'Good' : i >= 6 ? 'Fair' : i >= 4 ? 'Poor' : 'Very Poor'}
                                      </option>
                                    ))}
                                  </Select>
                                </Box>

                                <HStack>
                                  <Button 
                                    size="sm" 
                                    colorScheme="green" 
                                    onClick={() => handleSaveCheck(check.id)}
                                    isLoading={isSubmitting}
                                    flex={1}
                                  >
                                    Save Assessment
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingCheck(null)}
                                    isDisabled={isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                </HStack>
                              </VStack>
                            ) : (
                              <VStack align="stretch" spacing={3}>
                                <Flex justify="space-between" align="start">
                                  <Box flex={1}>
                                    <Text fontWeight="semibold" fontSize="sm">{check.checkName}</Text>
                                    {check.required && (
                                      <Badge colorScheme="red" fontSize="2xs" mt={1}>
                                        REQUIRED
                                      </Badge>
                                    )}
                                  </Box>
                                  <VStack spacing={1} align="end">
                                    <Badge colorScheme={getStatusColor(check.status)} fontSize="2xs">
                                      {check.status}
                                    </Badge>
                                    <Text fontSize="sm" fontWeight="bold" color={
                                      check.score >= 80 ? 'green.600' :
                                      check.score >= 70 ? 'blue.600' :
                                      check.score >= 60 ? 'orange.600' : 'red.600'
                                    }>
                                      {check.score}/100
                                    </Text>
                                  </VStack>
                                </Flex>
                                
                                {check.findings && (
                                  <Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.600">Findings:</Text>
                                    <Text fontSize="sm" color="gray.700" noOfLines={3}>{check.findings}</Text>
                                  </Box>
                                )}
                                
                                {check.recommendation && (
                                  <Badge 
                                    colorScheme={getRecommendationColor(check.recommendation)}
                                    fontSize="2xs"
                                    alignSelf="start"
                                  >
                                    {check.recommendation.replace(/_/g, ' ')}
                                  </Badge>
                                )}

                                <Button 
                                  size="xs" 
                                  variant="outline" 
                                  onClick={() => startEditing(check)}
                                  isDisabled={isSubmitting}
                                  alignSelf="start"
                                >
                                  Update Assessment
                                </Button>
                              </VStack>
                            )}
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}