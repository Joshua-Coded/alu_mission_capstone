// ============================================
// FILE: components/government/DueDiligencePanel.tsx
// Comprehensive due diligence checklist
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
    Badge,
    Button,
    Divider,
    SimpleGrid,
    Textarea,
    Select,
    useToast,
  } from '@chakra-ui/react';
  import { useState } from 'react';
  import { DueDiligenceCheck, Project } from '@/types/government.types';
  
  interface DueDiligencePanelProps {
    project: Project;
    onUpdateCheck: (checkId: string, status: string, findings: string, recommendation: string, score: number) => Promise<void>;
  }
  
  export default function DueDiligencePanel({ project, onUpdateCheck }: DueDiligencePanelProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const toast = useToast();
    const [editingCheck, setEditingCheck] = useState<string | null>(null);
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
  
    const getChecksByCategory = (category: string) => {
      return project.dueDiligenceChecks.filter(check => check.category === category);
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
      try {
        await onUpdateCheck(
          checkId,
          checkData.status,
          checkData.findings,
          checkData.recommendation,
          checkData.score
        );
        toast({
          title: 'Check Updated',
          description: 'Due diligence check has been updated successfully',
          status: 'success',
          duration: 3000,
        });
        setEditingCheck(null);
        setCheckData({ status: '', findings: '', recommendation: '', score: 0 });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update check',
          status: 'error',
          duration: 3000,
        });
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
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="purple.600">
            Due Diligence Checklist
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Complete all checks before final approval
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Overall Score */}
            <Box bg="purple.50" p={4} borderRadius="md">
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="semibold">Overall Due Diligence Score</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {project.complianceScore}/100
                </Text>
              </HStack>
              <Progress 
                value={project.complianceScore} 
                colorScheme={project.complianceScore >= 70 ? 'green' : project.complianceScore >= 50 ? 'yellow' : 'red'}
                size="lg" 
                borderRadius="full" 
              />
            </Box>
  
            <Divider />
  
            {/* Category Overview */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {categories.map((category) => {
                const progress = getCategoryProgress(category.name);
                const score = getCategoryScore(category.name);
                const checks = getChecksByCategory(category.name);
                
                return (
                  <Box key={category.name} p={4} borderWidth="1px" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme={category.color}>{category.label}</Badge>
                      <Text fontSize="sm" fontWeight="bold">{score}/100</Text>
                    </HStack>
                    <Progress value={progress} colorScheme={category.color} size="sm" borderRadius="full" mb={2} />
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
                              <option value="PENDING">Pending</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="FAILED">Failed</option>
                            </Select>
  
                            <Textarea
                              size="sm"
                              placeholder="Enter findings..."
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
                              <Text fontSize="sm">Score:</Text>
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
                            </HStack>
  
                            <HStack>
                              <Button size="sm" colorScheme="green" onClick={() => handleSaveCheck(check.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCheck(null)}>
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
                            
                            {check.assignedTo && (
                              <Text fontSize="xs" color="gray.500">
                                Assigned to: {check.assignedTo}
                              </Text>
                            )}
                            
                            {check.findings && (
                              <Box>
                                <Text fontSize="xs" fontWeight="semibold">Findings:</Text>
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
  
                            {check.completedAt && (
                              <Text fontSize="xs" color="gray.500">
                                Completed: {new Date(check.completedAt).toLocaleString()}
                              </Text>
                            )}
  
                            <Button size="xs" variant="outline" onClick={() => startEditing(check)}>
                              Edit Check
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