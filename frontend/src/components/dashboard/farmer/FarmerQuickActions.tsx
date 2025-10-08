import CreateProjectModal from "./CreateProjectModal";
import React from "react";
import { FiBarChart, FiCalendar, FiMapPin, FiPlus, FiSettings, FiUsers } from "react-icons/fi";

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Button,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';

const FarmerQuickActions: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const quickActions = [
    {
      label: 'Create Project',
      icon: FiPlus,
      colorScheme: 'brand',
      action: onOpen
    },
    {
      label: 'View Analytics',
      icon: FiBarChart,
      colorScheme: 'blue',
      action: () => console.log('Navigate to analytics')
    },
    {
      label: 'Farm Location',
      icon: FiMapPin,
      colorScheme: 'green',
      action: () => console.log('Navigate to farm location')
    },
    {
      label: 'Schedule Update',
      icon: FiCalendar,
      colorScheme: 'purple',
      action: () => console.log('Navigate to schedule')
    },
    {
      label: 'Manage Investors',
      icon: FiUsers,
      colorScheme: 'orange',
      action: () => console.log('Navigate to investors')
    },
    {
      label: 'Settings',
      icon: FiSettings,
      colorScheme: 'gray',
      action: () => console.log('Navigate to settings')
    },
  ];

  return (
    <>
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="brand.600">
            Quick Actions
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                leftIcon={<action.icon />}
                colorScheme={action.colorScheme}
                variant="outline"
                size="md"
                onClick={action.action}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md'
                }}
                transition="all 0.3s"
              >
                {action.label}
              </Button>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      <CreateProjectModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default FarmerQuickActions;
