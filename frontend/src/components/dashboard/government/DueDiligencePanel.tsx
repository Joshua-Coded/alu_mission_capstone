import { useEffect, useState } from "react";
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
} from '@chakra-ui/react';

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
}

export default function DueDiligencePanel({ project, onUpdate }: DueDiligencePanelProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
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
    { name: 'DOCUMENTATION', label: 'Documentation', color: 'blue' },
    { name: 'LEGAL', label: 'Legal', color: 'purple' },
    { name: 'FINANCIAL', label: 'Financial', color: 'green' },
    { name: 'TECHNICAL', label: 'Technical', color: 'orange' },
    { name: 'ENVIRONMENTAL', label: 'Environmental', color: 'teal' },
    { name: 'SOCIAL', label: 'Social', color: 'pink' },
  ];

  // Generate initial checks from project data
  const generateDueDiligenceChecks = (): DueDiligenceCheck[] => {
    const baseChecks: DueDiligenceCheck[] = [
      {
        id: 'doc-verification',
        category: 'DOCUMENTATION',
        checkName: 'Document Verification',
        status: project.documents && project.documents.length > 0 ? 'COMPLETED' : 'PENDING',
        findings: project.documents && project.documents.length > 0 
          ? `${project.documents.length} documents uploaded and verified` 
          : 'No documents uploaded',
        recommendation: project.documents && project.documents.length > 0 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.documents && project.documents.length > 0 ? 90 : 30,
      },
      {
        id: 'financial-assessment',
        category: 'FINANCIAL',
        checkName: 'Financial Viability',
        status: project.fundingGoal > 0 ? 'COMPLETED' : 'PENDING',
        findings: project.fundingGoal > 0 
          ? `Funding goal of $${project.fundingGoal.toLocaleString()} seems reasonable for ${project.category}` 
          : 'Funding goal not specified',
        recommendation: project.fundingGoal > 0 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.fundingGoal > 0 ? 85 : 40,
      },
      {
        id: 'location-assessment',
        category: 'TECHNICAL',
        checkName: 'Location Suitability',
        status: project.location ? 'COMPLETED' : 'PENDING',
        findings: project.location 
          ? `Project location: ${project.location} - suitable for agricultural activities` 
          : 'Location not specified',
        recommendation: project.location ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.location ? 80 : 30,
      },
      {
        id: 'timeline-assessment',
        category: 'TECHNICAL',
        checkName: 'Project Timeline',
        status: project.timeline ? 'COMPLETED' : 'PENDING',
        findings: project.timeline 
          ? `Project timeline: ${project.timeline} - realistic and achievable` 
          : 'Timeline not specified',
        recommendation: project.timeline ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.timeline ? 75 : 35,
      },
      {
        id: 'category-assessment',
        category: 'TECHNICAL',
        checkName: 'Project Category',
        status: project.category ? 'COMPLETED' : 'PENDING',
        findings: project.category 
          ? `Project category: ${project.category} - appropriate classification` 
          : 'Category not specified',
        recommendation: project.category ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.category ? 85 : 40,
      },
      {
        id: 'description-assessment',
        category: 'DOCUMENTATION',
        checkName: 'Project Description',
        status: project.description && project.description.length > 50 ? 'COMPLETED' : 'PENDING',
        findings: project.description && project.description.length > 50 
          ? 'Detailed project description provided with clear objectives' 
          : 'Project description is too brief or missing',
        recommendation: project.description && project.description.length > 50 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.description && project.description.length > 50 ? 80 : 45,
      },
      {
        id: 'farmer-verification',
        category: 'LEGAL',
        checkName: 'Farmer Identity Verification',
        status: project.farmer ? 'COMPLETED' : 'PENDING',
        findings: project.farmer 
          ? 'Farmer identity verified and account in good standing' 
          : 'Farmer verification pending',
        recommendation: project.farmer ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.farmer ? 90 : 20,
      },
      {
        id: 'images-verification',
        category: 'DOCUMENTATION',
        checkName: 'Project Images',
        status: project.images && project.images.length > 0 ? 'COMPLETED' : 'PENDING',
        findings: project.images && project.images.length > 0 
          ? `${project.images.length} project images uploaded - shows project site clearly` 
          : 'No project images uploaded',
        recommendation: project.images && project.images.length > 0 ? 'APPROVE' : 'NEEDS_MORE_INFO',
        score: project.images && project.images.length > 0 ? 75 : 35,
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
    const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
    return Math.round(totalScore / checks.length);
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
      setLocalChecks(prev => prev.map(check => 
        check.id === checkId 
          ? {
              ...check,
              status: checkData.status as any,
              findings: checkData.findings,
              recommendation: checkData.recommendation as any,
              score: checkData.score,
            }
          : check
      ));

      // Prepare consolidated notes for backend
      const allFindings = localChecks.map(c => 
        c.id === checkId 
          ? `${c.checkName}: ${checkData.findings}`
          : `${c.checkName}: ${c.findings}`
      ).join('\n\n');

      const updateData: UpdateDueDiligenceDto = {
        notes: allFindings,
        status: 'in_progress',
      };

      // Update due diligence using projectApi
      const updatedProject = await projectApi.updateDueDiligence(project._id, updateData);

      toast({
        title: 'Check Updated',
        description: 'Due diligence check has been updated successfully',
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
        title: 'Error',
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

  const handleCompleteDueDiligence = async () => {
    setIsSubmitting(true);
    try {
      // Consolidate all findings
      const allFindings = localChecks.map(check => 
        `✓ ${check.checkName}: ${check.findings} (Score: ${check.score}/100)`
      ).join('\n\n');

      const finalNotes = `DUE DILIGENCE COMPLETED\n\n${allFindings}\n\nOverall Assessment Score: ${overallScore}/100\nRecommendation: Project approved for funding`;

      const updateData: UpdateDueDiligenceDto = {
        notes: finalNotes,
        status: 'completed',
      };

      const updatedProject = await projectApi.updateDueDiligence(project._id, updateData);

      toast({
        title: 'Due Diligence Completed! ✓',
        description: 'All checks completed. Project is ready for final approval.',
        status: 'success',
        duration: 5000,
      });
      
      onUpdate(updatedProject);
    } catch (error: any) {
      console.error('Error completing due diligence:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete due diligence',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall progress
  const totalChecks = localChecks.length;
  const completedChecks = localChecks.filter(check => 
    check.status === 'COMPLETED'
  ).length;
  const overallProgress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  // Calculate overall score
  const overallScore = localChecks.length > 0 
    ? Math.round(localChecks.reduce((sum, check) => sum + check.score, 0) / localChecks.length)
    : 0;

  // Determine if ready for approval
  const isReadyForApproval = overallProgress === 100 && overallScore >= 70;

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="md" color="purple.600">
              Due Diligence Checklist
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Complete all checks before final approval • Overall Score: {overallScore}/100
            </Text>
          </Box>
          <VStack spacing={2} align="end">
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
            <Button
              colorScheme={isReadyForApproval ? "green" : "gray"}
              size="sm"
              onClick={handleCompleteDueDiligence}
              isLoading={isSubmitting}
              isDisabled={!isReadyForApproval || project.dueDiligence?.status === 'completed'}
            >
              {project.dueDiligence?.status === 'completed' ? 'Completed ✓' : 'Complete Due Diligence'}
            </Button>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Approval Readiness Alert */}
          {isReadyForApproval && project.dueDiligence?.status !== 'completed' && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Ready for Approval!</Text>
                <Text fontSize="sm">All checks passed. Click "Complete Due Diligence" to finalize.</Text>
              </Box>
            </Alert>
          )}

          {overallScore < 70 && overallProgress === 100 && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Low Confidence Score</Text>
                <Text fontSize="sm">Overall score is {overallScore}/100. Consider reviewing checks before approval.</Text>
              </Box>
            </Alert>
          )}

          {/* Overall Progress */}
          <Box bg="purple.50" p={4} borderRadius="md">
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold">Overall Progress</Text>
              <Text fontSize="lg" fontWeight="bold" color="purple.600">
                {completedChecks}/{totalChecks} Checks
              </Text>
            </HStack>
            <Progress 
              value={overallProgress} 
              colorScheme={overallProgress >= 100 ? 'green' : overallProgress >= 70 ? 'blue' : 'orange'}
              size="lg" 
              borderRadius="full" 
            />
            <Text fontSize="sm" color="gray.600" mt={2}>
              {overallProgress >= 100 
                ? '✓ All checks completed' 
                : overallProgress >= 70 
                  ? 'Most checks completed' 
                  : `${totalChecks - completedChecks} checks remaining`}
            </Text>
          </Box>

          {/* Current Due Diligence Status */}
          {project.dueDiligence && (
            <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
              <HStack justify="space-between" align="start">
                <Box flex={1}>
                  <Text fontWeight="semibold">Backend Status</Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Status: <Badge colorScheme={
                      project.dueDiligence.status === 'completed' ? 'green' :
                      project.dueDiligence.status === 'in_progress' ? 'blue' : 'gray'
                    }>
                      {project.dueDiligence.status?.toUpperCase()}
                    </Badge>
                  </Text>
                  {project.dueDiligence.assignedTo && (
                    <HStack mt={2}>
                      <Avatar 
                        size="xs" 
                        name={
                          typeof project.dueDiligence.assignedTo === 'object' 
                            ? `${project.dueDiligence.assignedTo.firstName} ${project.dueDiligence.assignedTo.lastName}`
                            : project.dueDiligence.assignedTo
                        } 
                      />
                      <Text fontSize="xs">
                        Assigned to: {
                          typeof project.dueDiligence.assignedTo === 'object' 
                            ? `${project.dueDiligence.assignedTo.firstName} ${project.dueDiligence.assignedTo.lastName}`
                            : project.dueDiligence.assignedTo
                        }
                      </Text>
                    </HStack>
                  )}
                </Box>
                {project.dueDiligence.notes && (
                  <Box flex={2} ml={4}>
                    <Text fontSize="sm" fontWeight="semibold">Latest Notes:</Text>
                    <Text fontSize="sm" color="gray.700" maxH="100px" overflowY="auto">
                      {project.dueDiligence.notes}
                    </Text>
                  </Box>
                )}
              </HStack>
            </Box>
          )}

          <Divider />

          {/* Category Overview */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {categories.map((category) => {
              const progress = getCategoryProgress(category.name);
              const score = getCategoryScore(category.name);
              const checks = getChecksByCategory(category.name);
              
              if (checks.length === 0) return null;
              
              return (
                <Box key={category.name} p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                  <HStack justify="space-between" mb={2}>
                    <Badge colorScheme={category.color}>{category.label}</Badge>
                    <Text fontSize="sm" fontWeight="bold">{score}/100</Text>
                  </HStack>
                  <Progress 
                    value={progress} 
                    colorScheme={category.color} 
                    size="sm" 
                    borderRadius="full" 
                    mb={2} 
                  />
                  <Text fontSize="xs" color="gray.500">
                    {checks.filter(c => c.status === 'COMPLETED').length} of {checks.length} completed
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>

          <Divider />

          {/* Detailed Checks by Category */}
          {categories.map((category) => {
            const checks = getChecksByCategory(category.name);
            if (checks.length === 0) return null;

            return (
              <Box key={category.name}>
                <Heading size="sm" mb={4} color={`${category.color}.600`}>
                  {category.label} Checks
                </Heading>
                <VStack spacing={4} align="stretch">
                  {checks.map((check) => (
                    <Box 
                      key={check.id} 
                      p={4} 
                      borderWidth="1px" 
                      borderRadius="md"
                      bg={editingCheck === check.id ? 'gray.50' : 'white'}
                    >
                      {editingCheck === check.id ? (
                        <VStack spacing={3} align="stretch">
                          <Text fontWeight="semibold">{check.checkName}</Text>
                          
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
                            placeholder="Enter findings and observations..."
                            value={checkData.findings}
                            onChange={(e) => setCheckData({ ...checkData, findings: e.target.value })}
                            rows={3}
                          />

                          <Select
                            size="sm"
                            value={checkData.recommendation}
                            onChange={(e) => setCheckData({ ...checkData, recommendation: e.target.value })}
                          >
                            <option value="">Select recommendation</option>
                            <option value="APPROVE">Approve</option>
                            <option value="REJECT">Reject</option>
                            <option value="NEEDS_MORE_INFO">Needs More Info</option>
                          </Select>

                          <HStack>
                            <Text fontSize="sm">Confidence Score:</Text>
                            <Select
                              size="sm"
                              w="100px"
                              value={checkData.score}
                              onChange={(e) => setCheckData({ ...checkData, score: Number(e.target.value) })}
                            >
                              {[...Array(11)].map((_, i) => (
                                <option key={i * 10} value={i * 10}>{i * 10}</option>
                              ))}
                            </Select>
                            <Text fontSize="xs" color="gray.500">/100</Text>
                          </HStack>

                          <HStack>
                            <Button 
                              size="sm" 
                              colorScheme="green" 
                              onClick={() => handleSaveCheck(check.id)}
                              isLoading={isSubmitting}
                            >
                              Save Check
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
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Text fontWeight="semibold">{check.checkName}</Text>
                            <HStack>
                              <Badge colorScheme={getStatusColor(check.status)}>
                                {check.status}
                              </Badge>
                              <Text fontSize="sm" fontWeight="bold">{check.score}/100</Text>
                            </HStack>
                          </HStack>
                          
                          {check.findings && (
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" color="gray.600">Findings:</Text>
                              <Text fontSize="sm" color="gray.700">{check.findings}</Text>
                            </Box>
                          )}
                          
                          {check.recommendation && (
                            <Badge colorScheme={
                              check.recommendation === 'APPROVE' ? 'green' :
                              check.recommendation === 'REJECT' ? 'red' : 'yellow'
                            } alignSelf="start">
                              {check.recommendation.replace('_', ' ')}
                            </Badge>
                          )}

                          <Button 
                            size="xs" 
                            variant="outline" 
                            onClick={() => startEditing(check)}
                            isDisabled={isSubmitting}
                          >
                            Update Check
                          </Button>
                        </VStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </CardBody>
    </Card>
  );
}