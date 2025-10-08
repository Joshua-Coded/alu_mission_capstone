import React from "react";
import { FiPlus } from "react-icons/fi";

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
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: IconComponent = FiPlus
}) => {
  const bg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={bg}
      p={8}
      borderRadius="lg"
      textAlign="center"
      border="2px dashed"
      borderColor="gray.200"
    >
      <VStack spacing={4}>
        <Icon as={IconComponent} boxSize={12} color="gray.400" />
        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            {title}
          </Text>
          <Text fontSize="sm" color={textColor} maxW="md">
            {description}
          </Text>
        </VStack>
        {actionLabel && onAction && (
          <Button
            colorScheme="brand"
            onClick={onAction}
            leftIcon={<IconComponent />}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState;
