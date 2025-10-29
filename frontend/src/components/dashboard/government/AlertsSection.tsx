import { useEffect, useState } from "react";
import { FiAlertCircle, FiBell, FiCheckCircle, FiClock, FiInfo, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Project as ApiProject, projectApi } from "@/lib/projectApi";

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Flex,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Text,
  useColorModeValue,
  Badge,
  HStack,
  Icon,
  Divider,
  Spinner,
  useToast,
} from '@chakra-ui/react';

interface AlertsSectionProps {
  projects: ApiProject[];
  onRefresh?: () => void;
}

export default function AlertsSection({ projects, onRefresh }: AlertsSectionProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [loading, setLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const toast = useToast();

  // Fetch platform stats for additional insights
  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      const stats = await projectApi.getPlatformStats();
      setPlatformStats(stats);
    } catch (error: any) {
      console.error('Error fetching platform stats:', error);
      toast({
        title: 'Error loading statistics',
        description: error.message || 'Failed to load platform statistics',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate real alerts from project data
  const generateAlerts = () => {
    const alerts: Array<{
      type: 'warning' | 'info' | 'success' | 'error';
      title: string;
      description: string;
      time: string;
      icon: any;
      projectId?: string;
      priority: number; // 1 = highest, 3 = lowest
    }> = [];

    // Count pending projects (HIGH PRIORITY)
    const pendingCount = projects.filter(p => p.status === 'submitted').length;
    if (pendingCount > 0) {
      alerts.push({
        type: 'warning',
        title: `${pendingCount} Project${pendingCount > 1 ? 's' : ''} Awaiting Initial Review`,
        description: `${pendingCount} new project${pendingCount > 1 ? 's' : ''} submitted and waiting for your review and approval`,
        time: 'Requires immediate attention',
        icon: FiAlertCircle,
        priority: 1,
      });
    }

    // Projects under review (MEDIUM PRIORITY)
    const underReviewCount = projects.filter(p => p.status === 'under_review').length;
    if (underReviewCount > 0) {
      const reviewTime = underReviewCount > 5 ? 'Consider prioritizing reviews' : 'In progress';
      alerts.push({
        type: 'info',
        title: `${underReviewCount} Project${underReviewCount > 1 ? 's' : ''} Under Review`,
        description: `${underReviewCount} project${underReviewCount > 1 ? 's' : ''} currently undergoing detailed review process`,
        time: reviewTime,
        icon: FiClock,
        priority: 2,
      });
    }

    // Due diligence in progress (MEDIUM PRIORITY)
    const dueDiligenceInProgress = projects.filter(
      p => p.dueDiligence?.status === 'in_progress'
    ).length;
    if (dueDiligenceInProgress > 0) {
      alerts.push({
        type: 'info',
        title: 'Due Diligence In Progress',
        description: `${dueDiligenceInProgress} project${dueDiligenceInProgress > 1 ? 's' : ''} undergoing thorough due diligence review`,
        time: 'Active review',
        icon: FiCheckCircle,
        priority: 2,
      });
    }

    // Recently approved projects (SUCCESS)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const approvedToday = projects.filter(project => {
      if (project.status !== 'active' && project.status !== 'verified') return false;
      if (!project.verification?.verifiedAt) return false;
      
      const verifiedDate = new Date(project.verification.verifiedAt);
      verifiedDate.setHours(0, 0, 0, 0);
      return verifiedDate.getTime() === today.getTime();
    }).length;

    if (approvedToday > 0) {
      alerts.push({
        type: 'success',
        title: 'Projects Approved Today',
        description: `Great work! You've approved ${approvedToday} project${approvedToday > 1 ? 's' : ''} for funding today`,
        time: 'Today',
        icon: FiCheckCircle,
        priority: 3,
      });
    }

    // Funding milestones (INFO)
    const fullyFundedCount = projects.filter(p => 
      p.status === 'active' && p.currentFunding >= p.fundingGoal
    ).length;
    
    if (fullyFundedCount > 0) {
      alerts.push({
        type: 'success',
        title: 'Projects Fully Funded',
        description: `${fullyFundedCount} project${fullyFundedCount > 1 ? 's' : ''} have reached their funding goals and are ready for execution`,
        time: 'Milestone achieved',
        icon: FiTrendingUp,
        priority: 3,
      });
    }

    // Blockchain deployment status (INFO)
    const blockchainFailed = projects.filter(p => p.blockchainStatus === 'failed').length;
    if (blockchainFailed > 0) {
      alerts.push({
        type: 'warning',
        title: 'Blockchain Deployment Issues',
        description: `${blockchainFailed} project${blockchainFailed > 1 ? 's' : ''} failed to deploy on blockchain but can still receive platform funding`,
        time: 'Needs monitoring',
        icon: FiInfo,
        priority: 2,
      });
    }

    // Contributor growth (SUCCESS)
    const totalContributors = projects.reduce((sum, project) => sum + (project.contributorsCount || 0), 0);
    if (totalContributors > 0 && platformStats) {
      alerts.push({
        type: 'success',
        title: 'Platform Engagement',
        description: `${totalContributors} total contributors supporting ${projects.length} agricultural projects`,
        time: 'Growing community',
        icon: FiUsers,
        priority: 3,
      });
    }

    // Default message if no critical alerts
    if (alerts.filter(a => a.priority <= 2).length === 0) {
      alerts.push({
        type: 'success',
        title: 'All Caught Up!',
        description: 'No pending reviews at the moment. All projects are being processed efficiently.',
        time: 'Current status',
        icon: FiCheckCircle,
        priority: 3,
      });
    }

    // Sort by priority (highest first)
    return alerts.sort((a, b) => a.priority - b.priority);
  };

  const alerts = generateAlerts();

  const getAlertColor = (type: string) => {
    const colors = {
      warning: 'orange',
      info: 'blue',
      success: 'green',
      error: 'red',
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    fetchPlatformStats();
  };

  if (loading) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} py={8}>
            <Spinner size="lg" color="purple.500" />
            <Text color="gray.600">Loading alerts...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // Calculate summary statistics
  const summaryStats = {
    totalProjects: projects.length,
    pendingReview: projects.filter(p => p.status === 'submitted').length,
    underReview: projects.filter(p => p.status === 'under_review').length,
    approved: projects.filter(p => p.status === 'active' || p.status === 'verified').length,
    rejected: projects.filter(p => p.status === 'rejected').length,
    fullyFunded: projects.filter(p => p.currentFunding >= p.fundingGoal).length,
  };

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader pb={3}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={FiBell} color="purple.500" boxSize={5} />
            <Heading size="md" color="purple.600">
              Government Alerts
            </Heading>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
              {alerts.length} Alerts
            </Badge>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        {/* Quick Stats Summary */}
        <HStack spacing={4} mt={3} fontSize="sm" flexWrap="wrap">
          {summaryStats.pendingReview > 0 && (
            <Badge colorScheme="orange" variant="subtle">
              ⚠️ {summaryStats.pendingReview} Pending
            </Badge>
          )}
          {summaryStats.underReview > 0 && (
            <Badge colorScheme="blue" variant="subtle">
              🔍 {summaryStats.underReview} In Review
            </Badge>
          )}
          {summaryStats.approved > 0 && (
            <Badge colorScheme="green" variant="subtle">
              ✅ {summaryStats.approved} Approved
            </Badge>
          )}
          {summaryStats.fullyFunded > 0 && (
            <Badge colorScheme="purple" variant="subtle">
              🎯 {summaryStats.fullyFunded} Funded
            </Badge>
          )}
        </HStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {alerts.map((alert, index) => (
            <Box key={index}>
              <Alert 
                status={alert.type} 
                borderRadius="lg" 
                variant="left-accent"
                py={3}
                alignItems="flex-start"
              >
                <AlertIcon as={alert.icon} boxSize={5} mt={1} />
                <Box flex="1">
                  <HStack justify="space-between" mb={1} align="flex-start">
                    <AlertTitle fontSize="sm" fontWeight="semibold" flex={1}>
                      {alert.title}
                    </AlertTitle>
                    <Badge 
                      colorScheme={getAlertColor(alert.type)} 
                      fontSize="2xs"
                      px={2}
                      py={1}
                    >
                      {alert.time}
                    </Badge>
                  </HStack>
                  <AlertDescription fontSize="sm" color="gray.700">
                    {alert.description}
                  </AlertDescription>
                </Box>
              </Alert>
              {index < alerts.length - 1 && <Divider mt={3} />}
            </Box>
          ))}
        </VStack>

        {/* Action Buttons */}
        <HStack spacing={2} mt={4}>
          <Button 
            size="sm" 
            variant="outline" 
            colorScheme="purple" 
            flex={1}
            onClick={() => window.location.href = '/dashboard/government?tab=projects&filter=submitted'}
          >
            Review Pending Projects
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            colorScheme="purple" 
            flex={1}
          >
            View All Reports
          </Button>
        </HStack>
      </CardBody>
    </Card>
  );
}