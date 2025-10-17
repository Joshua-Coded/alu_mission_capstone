import React from "react";
import { Project } from "@/lib/projectApi";

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Image,
  Box,
  Icon,
  Progress,
  Divider,
  AspectRatio,
  useColorModeValue,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiEdit,
  FiShare2,
  FiMoreVertical,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDatabase,
} from 'react-icons/fi';

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onShare?: (project: Project) => void;
  showBlockchainInfo?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onEdit,
  onShare,
  showBlockchainInfo = false,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.750');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'orange',
      under_review: 'yellow',
      active: 'green',
      rejected: 'red',
      funded: 'purple',
      closed: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      submitted: FiClock,
      under_review: FiClock,
      active: FiCheckCircle,
      rejected: FiAlertCircle,
      funded: FiCheckCircle,
      closed: FiCheckCircle,
    };
    return icons[status] || FiClock;
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const fundingProgress = project.fundingGoal > 0 
    ? Math.min((project.currentFunding / project.fundingGoal) * 100, 100)
    : 0;

  const defaultImage = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: 'green.400',
      }}
      cursor="pointer"
      onClick={() => onViewDetails?.(project)}
      position="relative"
    >
      {/* Project Image */}
      <AspectRatio ratio={16 / 9}>
        <Image
          src={project.images?.[0] || defaultImage}
          alt={project.title}
          objectFit="cover"
          fallbackSrc={defaultImage}
        />
      </AspectRatio>

      {/* Status Badge - Positioned over image */}
      <Box position="absolute" top={3} right={3} zIndex={1}>
        <Badge
          colorScheme={getStatusColor(project.status)}
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={1}
          boxShadow="sm"
          bg={useColorModeValue('white', 'gray.800')}
        >
          <Icon as={getStatusIcon(project.status)} boxSize={3} />
          {getStatusLabel(project.status)}
        </Badge>
      </Box>

      {/* Blockchain Badge */}
      {showBlockchainInfo && project.blockchainStatus === 'created' && (
        <Box position="absolute" top={3} left={3} zIndex={1}>
          <Badge
            colorScheme="blue"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={1}
            boxShadow="sm"
            bg={useColorModeValue('white', 'gray.800')}
          >
            <Icon as={FiDatabase} boxSize={3} />
            On-chain
          </Badge>
        </Box>
      )}

      <CardBody p={5}>
        <VStack spacing={4} align="stretch">
          {/* Title */}
          <Box>
            <Text
              fontSize="lg"
              fontWeight="bold"
              noOfLines={2}
              lineHeight="1.3"
              mb={2}
              color={useColorModeValue('gray.800', 'white')}
            >
              {project.title}
            </Text>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {project.description}
            </Text>
          </Box>

          <Divider />

          {/* Project Info */}
          <VStack spacing={2} align="stretch" fontSize="sm">
            <HStack>
              <Icon as={FiMapPin} color="gray.500" boxSize={4} />
              <Text color="gray.600" flex="1" noOfLines={1}>
                {project.location}
              </Text>
            </HStack>

            <HStack>
              <Icon as={FiCalendar} color="gray.500" boxSize={4} />
              <Text color="gray.600" flex="1">
                {project.timeline}
              </Text>
            </HStack>

            <HStack>
              <Icon as={FiDollarSign} color="gray.500" boxSize={4} />
              <HStack flex="1" justify="space-between">
                <Text color="gray.600" fontSize="xs">
                  ${project.currentFunding.toLocaleString()}
                </Text>
                <Text fontWeight="bold" color="green.600">
                  ${project.fundingGoal.toLocaleString()}
                </Text>
              </HStack>
            </HStack>
          </VStack>

          {/* Funding Progress */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                Funding Progress
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="green.600">
                {fundingProgress.toFixed(1)}%
              </Text>
            </HStack>
            <Progress
              value={fundingProgress}
              size="sm"
              colorScheme="green"
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.700')}
            />
          </Box>

          {/* Action Buttons */}
          <HStack spacing={2} pt={2}>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FiEye />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(project);
              }}
              flex="1"
            >
              View
            </Button>

            {onEdit && project.status === 'submitted' && (
              <IconButton
                size="sm"
                icon={<FiEdit />}
                aria-label="Edit project"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
              />
            )}

            {onShare && (
              <IconButton
                size="sm"
                icon={<FiShare2 />}
                aria-label="Share project"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(project);
                }}
              />
            )}

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                size="sm"
                variant="ghost"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                <MenuItem
                  icon={<FiEye />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(project);
                  }}
                >
                  View Details
                </MenuItem>
                {onEdit && project.status === 'submitted' && (
                  <MenuItem
                    icon={<FiEdit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                  >
                    Edit Project
                  </MenuItem>
                )}
                {onShare && (
                  <MenuItem
                    icon={<FiShare2 />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(project);
                    }}
                  >
                    Share Project
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;