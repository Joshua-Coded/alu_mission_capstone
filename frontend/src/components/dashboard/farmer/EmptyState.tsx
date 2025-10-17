import React from "react";
import { FiAlertCircle, FiBarChart, FiFolder, FiPlus, FiUsers } from "react-icons/fi";

import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
  variant?: 'default' | 'projects' | 'investors' | 'analytics';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: IconComponent,
  variant = 'default'
}) => {
  const bg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('gray.400', 'gray.500');

  // Auto-select icon based on variant if not provided
  const defaultIcons = {
    default: FiAlertCircle,
    projects: FiFolder,
    investors: FiUsers,
    analytics: FiBarChart,
  };

  const DisplayIcon = IconComponent || defaultIcons[variant];

  return (
    <Box
      bg={bg}
      p={12}
      borderRadius="xl"
      textAlign="center"
      border="2px dashed"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{
        borderColor: 'green.300',
        transform: 'translateY(-2px)',
      }}
    >
      <VStack spacing={6}>
        <Icon as={DisplayIcon} boxSize={16} color={iconColor} />
        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            {title}
          </Text>
          <Text fontSize="md" color={textColor} maxW="md">
            {description}
          </Text>
        </VStack>
        {actionLabel && onAction && (
          <Button
            colorScheme="green"
            size="lg"
            onClick={onAction}
            leftIcon={<FiPlus />}
            _hover={{
              transform: 'scale(1.05)',
            }}
            transition="all 0.2s"
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

// Example usage in different scenarios
export const EmptyProjectsState: React.FC<{ onCreateProject: () => void }> = ({ onCreateProject }) => (
  <EmptyState
    variant="projects"
    title="No Projects Yet"
    description="Start your farming journey by creating your first project. Share your vision with investors and get funded!"
    actionLabel="Create Your First Project"
    onAction={onCreateProject}
  />
);

export const EmptyInvestorsState: React.FC = () => (
  <EmptyState
    variant="investors"
    title="No Investors Yet"
    description="Once your projects are approved and funded, your investors will appear here. Make sure your projects are attractive to get more support!"
  />
);

export const EmptyAnalyticsState: React.FC = () => (
  <EmptyState
    variant="analytics"
    title="No Data Available"
    description="Analytics will appear here once you have active projects with funding. Create and get your projects approved to see insights!"
  />
);

export const EmptySubmittedProjectsState: React.FC = () => (
  <EmptyState
    variant="projects"
    title="No Submitted Projects"
    description="You don't have any projects awaiting verification. All your projects are either active or in other states."
  />
);

export const EmptyActiveProjectsState: React.FC<{ onCreateProject: () => void }> = ({ onCreateProject }) => (
  <EmptyState
    variant="projects"
    title="No Active Projects"
    description="You don't have any active projects receiving funding yet. Create a project and get it approved to start receiving contributions!"
    actionLabel="Create New Project"
    onAction={onCreateProject}
  />
);

export const EmptyRejectedProjectsState: React.FC = () => (
  <EmptyState
    variant="projects"
    icon={FiAlertCircle}
    title="No Rejected Projects"
    description="Great news! None of your projects have been rejected. Keep up the good work!"
  />
);

export default EmptyState;