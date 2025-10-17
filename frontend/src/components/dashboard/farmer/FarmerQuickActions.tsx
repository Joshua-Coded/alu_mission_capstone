import CreateProjectModal from "./CreateProjectModal";
import React from "react";
import { useRouter } from "next/navigation";

import { 
  FiPlus, 
  FiFolder,
  FiSettings,
  FiPackage
} from "react-icons/fi";

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Button,
  useColorModeValue,
  useDisclosure,
  Icon,
  Tooltip,
} from '@chakra-ui/react';

interface FarmerQuickActionsProps {
  onProjectCreated?: () => void;
}

const FarmerQuickActions: React.FC<FarmerQuickActionsProps> = ({ onProjectCreated }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleProjectCreated = () => {
    onClose();
    if (onProjectCreated) {
      onProjectCreated();
    }
  };

  const quickActions = [
    {
      label: 'Create Project',
      icon: FiPlus,
      colorScheme: 'green',
      action: onOpen,
      tooltip: 'Submit a new farming project for funding',
    },
    {
      label: 'My Projects',
      icon: FiFolder,
      colorScheme: 'blue',
      action: () => router.push('/dashboard/farmer?tab=projects'),
      tooltip: 'View and manage all your projects',
    },
    {
      label: 'Inventory',
      icon: FiPackage,
      colorScheme: 'purple',
      action: () => router.push('/dashboard/farmer?tab=inventory'),
      tooltip: 'Track crops and farm inventory',
    },
    {
      label: 'Profile',
      icon: FiSettings,
      colorScheme: 'gray',
      action: () => router.push('/dashboard/farmer?tab=profile'),
      tooltip: 'Update your profile and settings',
    },
  ];

  return (
    <>
      <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="sm">
        <CardHeader pb={3}>
          <Heading size="md" color="green.600">
            Quick Actions
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {quickActions.map((action, index) => (
              <Tooltip 
                key={index}
                label={action.tooltip}
                hasArrow
                placement="top"
              >
                <Button
                  leftIcon={<Icon as={action.icon} boxSize={5} />}
                  colorScheme={action.colorScheme}
                  variant="outline"
                  size="md"
                  onClick={action.action}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'md',
                    bg: `${action.colorScheme}.50`,
                  }}
                  transition="all 0.2s"
                  fontWeight="medium"
                  h="auto"
                  py={4}
                  w="full"
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isOpen} 
        onClose={onClose}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};

export default FarmerQuickActions;