import { FiAlertCircle, FiBell, FiCheckCircle, FiClock, FiInfo } from "react-icons/fi";
import { Project as ApiProject } from "@/lib/projectApi";

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
} from '@chakra-ui/react';

interface AlertsSectionProps {
  projects: ApiProject[];
}

export default function AlertsSection({ projects }: AlertsSectionProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Generate alerts from projects
  const generateAlerts = () => {
    const alerts: Array<{
      type: 'warning' | 'info' | 'success' | 'error';
      title: string;
      description: string;
      time: string;
      icon: any;
      projectId?: string;
    }> = [];

    // Count pending projects
    const pendingCount = projects.filter(p => p.status === 'submitted').length;
    if (pendingCount > 0) {
      alerts.push({
        type: 'warning',
        title: `${pendingCount} Project${pendingCount > 1 ? 's' : ''} Awaiting Review`,
        description: `You have ${pendingCount} new project${pendingCount > 1 ? 's' : ''} pending initial review`,
        time: 'Just now',
        icon: FiAlertCircle,
      });
    }

    // Check for projects under review for too long (more than 3)
    const underReviewCount = projects.filter(p => p.status === 'under_review').length;
    if (underReviewCount > 3) {
      alerts.push({
        type: 'info',
        title: 'Projects Under Review',
        description: `${underReviewCount} projects are currently under review. Consider prioritizing to avoid delays.`,
        time: '1 hour ago',
        icon: FiClock,
      });
    }

    // Check for recently submitted projects (within last 24h)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = projects.filter(project => {
      const projectDate = new Date(project.createdAt);
      projectDate.setHours(0, 0, 0, 0);
      return projectDate.getTime() === today.getTime();
    });

    if (todaySubmissions.length > 0) {
      alerts.push({
        type: 'info',
        title: 'New Submissions Today',
        description: `${todaySubmissions.length} project${todaySubmissions.length > 1 ? 's' : ''} submitted today`,
        time: 'Today',
        icon: FiBell,
      });
    }

    // Check for projects with due diligence in progress
    const dueDiligenceInProgress = projects.filter(
      p => p.dueDiligence?.status === 'in_progress'
    ).length;
    if (dueDiligenceInProgress > 0) {
      alerts.push({
        type: 'info',
        title: 'Due Diligence In Progress',
        description: `${dueDiligenceInProgress} project${dueDiligenceInProgress > 1 ? 's' : ''} currently undergoing due diligence review`,
        time: '2 hours ago',
        icon: FiCheckCircle,
      });
    }

    // Success message for approved projects today
    const approvedToday = projects.filter(project => {
      const projectDate = new Date(project.updatedAt);
      projectDate.setHours(0, 0, 0, 0);
      return projectDate.getTime() === today.getTime() && project.status === 'active';
    }).length;

    if (approvedToday > 0) {
      alerts.push({
        type: 'success',
        title: 'Projects Approved Today',
        description: `Great work! You've approved ${approvedToday} project${approvedToday > 1 ? 's' : ''} today`,
        time: 'Today',
        icon: FiCheckCircle,
      });
    }

    // Default message if no alerts
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        title: 'All Caught Up!',
        description: 'No pending alerts at the moment. Great work staying on top of reviews!',
        time: 'Now',
        icon: FiCheckCircle,
      });
    }

    return alerts;
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

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader pb={3}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={FiBell} color="purple.500" boxSize={5} />
            <Heading size="md" color="purple.600">
              Alerts & Notifications
            </Heading>
          </HStack>
          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
            {alerts.length}
          </Badge>
        </Flex>
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
              >
                <AlertIcon as={alert.icon} boxSize={5} />
                <Box flex="1">
                  <HStack justify="space-between" mb={1}>
                    <AlertTitle fontSize="sm" fontWeight="semibold">
                      {alert.title}
                    </AlertTitle>
                    <Text fontSize="xs" color="gray.500">
                      {alert.time}
                    </Text>
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

        {alerts.length > 1 && (
          <Button 
            size="sm" 
            variant="ghost" 
            colorScheme="purple" 
            w="full" 
            mt={4}
          >
            View All Notifications
          </Button>
        )}
      </CardBody>
    </Card>
  );
}