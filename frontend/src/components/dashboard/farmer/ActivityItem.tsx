import React, { useEffect, useState } from "react";

import { 
  FiCheckCircle, 
  FiCloud, 
  FiDollarSign, 
  FiTarget,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiFileText
} from "react-icons/fi";

import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  VStack,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  HStack,
} from '@chakra-ui/react';

// Activity type derived from project events
interface Activity {
  id: string;
  type: 'investment' | 'milestone' | 'weather' | 'goal' | 'verification' | 'funding' | 'contributor';
  title: string;
  description: string;
  amount?: number;
  timestamp: Date;
  projectId?: string;
  projectTitle?: string;
}

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'investment': return FiDollarSign;
      case 'milestone': return FiCheckCircle;
      case 'weather': return FiCloud;
      case 'goal': return FiTarget;
      case 'verification': return FiFileText;
      case 'funding': return FiTrendingUp;
      case 'contributor': return FiUsers;
      default: return FiCheckCircle;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'investment': return 'blue.500';
      case 'milestone': return 'green.500';
      case 'weather': return 'orange.500';
      case 'goal': return 'purple.500';
      case 'verification': return 'yellow.500';
      case 'funding': return 'teal.500';
      case 'contributor': return 'pink.500';
      default: return 'gray.500';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Box
      pb={4}
      borderBottom="1px"
      borderColor={borderColor}
      _last={{ borderBottom: 'none', pb: 0 }}
    >
      <Flex align="start" gap={3}>
        <Box
          p={2}
          borderRadius="full"
          bg={useColorModeValue('gray.100', 'gray.700')}
        >
          <Icon
            as={getActivityIcon(activity.type)}
            color={getActivityIconColor(activity.type)}
            boxSize={4}
          />
        </Box>
        
        <Flex flex={1} justify="space-between" align="start">
          <Box flex={1}>
            <Text fontWeight="semibold" mb={1}>
              {activity.title}
            </Text>
            {activity.amount && (
              <Text color="green.500" fontWeight="bold" fontSize="lg">
                ${activity.amount.toLocaleString()}
              </Text>
            )}
            <Text fontSize="sm" color="gray.600" mb={1}>
              {activity.description}
            </Text>
            <HStack spacing={2}>
              <Text fontSize="xs" color="gray.400">
                {formatTimeAgo(activity.timestamp)}
              </Text>
              {activity.projectTitle && (
                <Badge fontSize="xs" colorScheme="blue">
                  {activity.projectTitle}
                </Badge>
              )}
            </HStack>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

// Activity Feed Component that fetches and generates activities from projects
export const ActivityFeed: React.FC<{ limit?: number }> = ({ limit = 10 }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch projects from your API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/my-projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      const projects = await response.json();
      
      // Generate activities from project data
      const generatedActivities: Activity[] = [];
      
      projects.forEach((project: any) => {
        // Project submission activity
        if (project.submittedAt) {
          generatedActivities.push({
            id: `submit-${project._id}`,
            type: 'verification',
            title: 'Project Submitted',
            description: `Your project "${project.title}" was submitted for government verification`,
            timestamp: new Date(project.submittedAt),
            projectId: project._id,
            projectTitle: project.title,
          });
        }
        
        // Project verification activity
        if (project.status === 'active' && project.verification?.verifiedAt) {
          generatedActivities.push({
            id: `verify-${project._id}`,
            type: 'milestone',
            title: 'Project Approved! 🎉',
            description: `"${project.title}" has been verified and is now accepting funding`,
            timestamp: new Date(project.verification.verifiedAt),
            projectId: project._id,
            projectTitle: project.title,
          });
        }
        
        // Project rejection activity
        if (project.status === 'rejected' && project.verification?.rejectionReason) {
          generatedActivities.push({
            id: `reject-${project._id}`,
            type: 'verification',
            title: 'Project Needs Attention',
            description: project.verification.rejectionReason,
            timestamp: new Date(project.updatedAt),
            projectId: project._id,
            projectTitle: project.title,
          });
        }
        
        // Funding milestone activities
        if (project.currentFunding > 0) {
          const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;
          
          if (fundingPercentage >= 100) {
            generatedActivities.push({
              id: `funded-${project._id}`,
              type: 'milestone',
              title: 'Funding Goal Reached! 🎯',
              description: `"${project.title}" has reached its funding goal`,
              amount: project.fundingGoal,
              timestamp: new Date(project.updatedAt),
              projectId: project._id,
              projectTitle: project.title,
            });
          } else if (fundingPercentage >= 75) {
            generatedActivities.push({
              id: `funding-75-${project._id}`,
              type: 'funding',
              title: 'Nearly There!',
              description: `"${project.title}" is 75% funded`,
              amount: project.currentFunding,
              timestamp: new Date(project.updatedAt),
              projectId: project._id,
              projectTitle: project.title,
            });
          } else if (fundingPercentage >= 50) {
            generatedActivities.push({
              id: `funding-50-${project._id}`,
              type: 'funding',
              title: 'Halfway Funded!',
              description: `"${project.title}" reached 50% of funding goal`,
              amount: project.currentFunding,
              timestamp: new Date(project.updatedAt),
              projectId: project._id,
              projectTitle: project.title,
            });
          } else if (fundingPercentage >= 25) {
            generatedActivities.push({
              id: `funding-25-${project._id}`,
              type: 'funding',
              title: 'First Quarter Funded',
              description: `"${project.title}" reached 25% of funding goal`,
              amount: project.currentFunding,
              timestamp: new Date(project.updatedAt),
              projectId: project._id,
              projectTitle: project.title,
            });
          }
        }
        
        // Contributor activity
        if (project.contributorsCount > 0) {
          generatedActivities.push({
            id: `contributors-${project._id}`,
            type: 'contributor',
            title: 'New Contributors',
            description: `${project.contributorsCount} investor${project.contributorsCount > 1 ? 's' : ''} supporting "${project.title}"`,
            timestamp: new Date(project.updatedAt),
            projectId: project._id,
            projectTitle: project.title,
          });
        }
        
        // Blockchain activity
        if (project.blockchainStatus === 'created' && project.blockchainCreatedAt) {
          generatedActivities.push({
            id: `blockchain-${project._id}`,
            type: 'milestone',
            title: 'On Blockchain! ⛓️',
            description: `"${project.title}" has been created on the blockchain`,
            timestamp: new Date(project.blockchainCreatedAt),
            projectId: project._id,
            projectTitle: project.title,
          });
        }
        
        // Due diligence completion
        if (project.dueDiligence?.status === 'completed' && project.dueDiligence?.completedAt) {
          generatedActivities.push({
            id: `diligence-${project._id}`,
            type: 'milestone',
            title: 'Due Diligence Complete',
            description: `Due diligence completed for "${project.title}"`,
            timestamp: new Date(project.dueDiligence.completedAt),
            projectId: project._id,
            projectTitle: project.title,
          });
        }
      });
      
      // Sort by timestamp (newest first) and limit
      const sortedActivities = generatedActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <VStack py={8}>
            <Spinner size="lg" color="green.500" />
            <Text color="gray.600">Loading activities...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack py={8}>
            <Icon as={FiAlertCircle} boxSize={12} color="gray.400" />
            <Text color="gray.600">No recent activity</Text>
            <Text fontSize="sm" color="gray.500">
              Activities will appear here as your projects progress
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Recent Activity</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ActivityItem;