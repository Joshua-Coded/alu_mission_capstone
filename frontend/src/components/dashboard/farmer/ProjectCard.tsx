import React, { useState } from "react";

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Button,
  useColorModeValue,
  Icon,
  Image,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Card,
  CardBody,
  AspectRatio,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiEye,
  FiMapPin,
  FiUsers,
  FiTrendingUp,
  FiMoreVertical,
  FiEdit3,
  FiShare2,
  FiSend,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiImage,
  FiVideo,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

interface Project {
  id: string;
  name: string;
  progress: number;
  funding: string;
  fundingGoal: string;
  investors: number;
  phase: string;
  roi: string;
  status: string;
  description: string;
  expectedHarvest: string;
  location: string;
  images?: string[];
  videos?: string[];
}

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onShare?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onViewDetails,
  onEdit,
  onShare 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [imageError, setImageError] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  
  // Combine images and videos into media array
  const allMedia = [
    ...(project.images || []).map(img => ({ type: 'image', url: img })),
    ...(project.videos || []).map(vid => ({ type: 'video', url: vid }))
  ];
  
  const hasMultipleMedia = allMedia.length > 1;
  const currentMedia = allMedia[currentMediaIndex];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'funding': return 'blue';
      case 'completed': return 'purple';
      case 'cancelled': return 'red';
      case 'pending_verification': return 'yellow';
      default: return 'gray';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'growing': return 'green';
      case 'planting': return 'blue';
      case 'harvest': return 'orange';
      case 'completed': return 'purple';
      default: return 'gray';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'Planning': return FiCalendar;
      case 'Planting': return FiSend;
      case 'Growing': return FiSend;
      case 'Harvest': return FiCheckCircle;
      case 'Completed': return FiCheckCircle;
      default: return FiClock;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return FiCheckCircle;
      case 'funding': return FiDollarSign;
      case 'completed': return FiCheckCircle;
      case 'cancelled': return FiAlertCircle;
      case 'pending_verification': return FiClock;
      default: return FiClock;
    }
  };

  const getGradientBg = (id: string) => {
    const gradients = [
      'linear(to-br, green.400, green.600)',
      'linear(to-br, blue.400, blue.600)',
      'linear(to-br, purple.400, purple.600)',
      'linear(to-br, orange.400, orange.600)',
      'linear(to-br, teal.400, teal.600)',
    ];
    const index = parseInt(id) % gradients.length;
    return gradients[index];
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: 'brand.300',
      }}
      cursor="pointer"
      onClick={() => onViewDetails(project)}
    >
      {/* Project Media (Images/Videos) with Gallery */}
      <Box position="relative" h="200px">
        {currentMedia ? (
          currentMedia.type === 'video' ? (
            <AspectRatio ratio={16 / 9} h="200px">
              <video
                src={currentMedia.url}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={(e) => e.stopPropagation()}
              />
            </AspectRatio>
          ) : (
            <Image
              src={currentMedia.url}
              alt={`${project.name} - Image ${currentMediaIndex + 1}`}
              w="full"
              h="full"
              objectFit="cover"
              onError={() => setImageError(true)}
              fallback={
                <Box
                  w="full"
                  h="full"
                  bgGradient={getGradientBg(project.id)}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiImage} boxSize={12} color="whiteAlpha.700" />
                </Box>
              }
            />
          )
        ) : (
          <Box
            w="full"
            h="full"
            bgGradient={getGradientBg(project.id)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={2}
          >
            <Icon as={FiImage} boxSize={12} color="whiteAlpha.700" />
            <Text color="whiteAlpha.800" fontSize="sm" fontWeight="medium">
              {project.name}
            </Text>
          </Box>
        )}
        
        {/* Media Navigation Arrows */}
        {hasMultipleMedia && (
          <>
            <IconButton
              icon={<FiChevronLeft />}
              position="absolute"
              left={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={handlePrevMedia}
              size="sm"
              colorScheme="blackAlpha"
              bg="blackAlpha.600"
              color="white"
              _hover={{ bg: 'blackAlpha.800' }}
              aria-label="Previous media"
              zIndex={2}
            />
            <IconButton
              icon={<FiChevronRight />}
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={handleNextMedia}
              size="sm"
              colorScheme="blackAlpha"
              bg="blackAlpha.600"
              color="white"
              _hover={{ bg: 'blackAlpha.800' }}
              aria-label="Next media"
              zIndex={2}
            />
          </>
        )}

        {/* Media Counter */}
        {allMedia.length > 0 && (
          <Box
            position="absolute"
            top={4}
            left={4}
            bg="blackAlpha.700"
            backdropFilter="blur(10px)"
            px={3}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon 
              as={currentMedia?.type === 'video' ? FiVideo : FiImage} 
              color="white" 
              boxSize={3} 
            />
            <Text color="white" fontSize="xs" fontWeight="medium">
              {currentMediaIndex + 1} / {allMedia.length}
            </Text>
          </Box>
        )}
        
        {/* Status and Phase Badges */}
        <Box
          position="absolute"
          top={4}
          right={4}
          display="flex"
          gap={2}
          flexDirection="column"
        >
          <Badge
            colorScheme={getStatusColor(project.status)}
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="bold"
            textTransform="capitalize"
            display="flex"
            alignItems="center"
            gap={1}
            bg={`${getStatusColor(project.status)}.500`}
            color="white"
          >
            <Icon as={getStatusIcon(project.status)} boxSize={3} />
            {project.status.replace('_', ' ')}
          </Badge>
          <Badge
            colorScheme={getPhaseColor(project.phase)}
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            display="flex"
            alignItems="center"
            gap={1}
            bg={`${getPhaseColor(project.phase)}.500`}
            color="white"
          >
            <Icon as={getPhaseIcon(project.phase)} boxSize={3} />
            {project.phase}
          </Badge>
        </Box>
        
        {/* Funding Progress Overlay */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="blackAlpha.700"
          backdropFilter="blur(10px)"
          p={3}
        >
          <VStack spacing={1} align="stretch">
            <HStack justify="space-between">
              <Text color="white" fontSize="sm" fontWeight="medium">
                {project.funding}
              </Text>
              <Text color="white" fontSize="sm">
                {project.fundingGoal}
              </Text>
            </HStack>
            <Progress
              value={project.progress}
              colorScheme="brand"
              size="sm"
              borderRadius="full"
              bg="whiteAlpha.300"
            />
            <Text color="white" fontSize="xs" textAlign="center">
              {project.progress}% funded
            </Text>
          </VStack>
        </Box>
      </Box>

      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between" align="start">
              <VStack spacing={1} align="start" flex={1}>
                <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                  {project.name}
                </Text>
                <HStack spacing={2}>
                  <Icon as={FiMapPin} color="gray.500" boxSize={3} />
                  <Text fontSize="sm" color="gray.600">
                    {project.location}
                  </Text>
                </HStack>
              </VStack>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem 
                    icon={<FiEye />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(project);
                    }}
                  >
                    View Details
                  </MenuItem>
                  {onEdit && (
                    <MenuItem 
                      icon={<FiEdit3 />} 
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
            
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {project.description}
            </Text>
          </VStack>

          {/* Media Info */}
          {allMedia.length > 0 && (
            <HStack spacing={4} fontSize="xs" color="gray.500">
              {(project.images?.length || 0) > 0 && (
                <HStack spacing={1}>
                  <Icon as={FiImage} />
                  <Text>{project.images?.length} photo{project.images!.length > 1 ? 's' : ''}</Text>
                </HStack>
              )}
              {(project.videos?.length || 0) > 0 && (
                <HStack spacing={1}>
                  <Icon as={FiVideo} />
                  <Text>{project.videos?.length} video{project.videos!.length > 1 ? 's' : ''}</Text>
                </HStack>
              )}
            </HStack>
          )}

          {/* Project Info Grid */}
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={1}>
                <Icon as={FiCalendar} color="purple.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Harvest:</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="medium">
                {project.expectedHarvest}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <HStack spacing={1}>
                <Icon as={FiDollarSign} color="green.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Funding:</Text>
              </HStack>
              <Text fontSize="sm" fontWeight="medium">
                {project.funding} / {project.fundingGoal}
              </Text>
            </HStack>
          </VStack>

          {/* Stats */}
          <HStack spacing={4} justify="space-around">
            <VStack spacing={1}>
              <HStack spacing={1} align="center">
                <Icon as={FiUsers} color="blue.500" boxSize={4} />
                <Text fontSize="lg" fontWeight="bold" color="blue.500">
                  {project.investors}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Investors
              </Text>
            </VStack>
            
            <VStack spacing={1}>
              <HStack spacing={1} align="center">
                <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  {project.roi}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Expected ROI
              </Text>
            </VStack>
            
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="purple.500">
                {project.progress}%
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Progress
              </Text>
            </VStack>
          </HStack>

          {/* Action Buttons */}
          <HStack spacing={2}>
            <Button
              leftIcon={<FiEye />}
              variant="outline"
              size="sm"
              flex={1}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(project);
              }}
            >
              View Details
            </Button>
            
            {project.status === 'pending_verification' && (
              <Tooltip label="Awaiting government verification">
                <IconButton
                  icon={<FiClock />}
                  variant="ghost"
                  size="sm"
                  aria-label="Pending verification"
                  color="yellow.500"
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            )}
            
            {onShare && (
              <Tooltip label="Share project">
                <IconButton
                  icon={<FiShare2 />}
                  variant="ghost"
                  size="sm"
                  aria-label="Share project"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(project);
                  }}
                />
              </Tooltip>
            )}
          </HStack>

          {/* Verification Status for Pending Projects */}
          {project.status === 'pending_verification' && (
            <Box
              bg="yellow.50"
              border="1px"
              borderColor="yellow.200"
              borderRadius="md"
              p={3}
            >
              <HStack spacing={2}>
                <Icon as={FiClock} color="yellow.500" />
                <VStack spacing={0} align="start" flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="yellow.700">
                    Pending Verification
                  </Text>
                  <Text fontSize="xs" color="yellow.600">
                    Your project is being reviewed by government officials
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;