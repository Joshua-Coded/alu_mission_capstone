import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Spinner,
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
  FiRefreshCw,
  FiAward,
} from 'react-icons/fi';

interface ProjectCardProps {
  project: Project;
  onViewDetails?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onShare?: (project: Project) => void;
  showBlockchainInfo?: boolean;
}

interface BlockchainData {
  currentFunding: string;
  fundingGoal: string;
  isFullyFunded: boolean;
  contributorCount?: number;
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
  const badgeBg = useColorModeValue('white', 'gray.800');
  const titleColor = useColorModeValue('gray.800', 'white');
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  // removed progressColor if unused
  
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);
  const [loadingBlockchain, setLoadingBlockchain] = useState(false);

  const fetchBlockchainData = React.useCallback(async () => {
    try {
      setLoadingBlockchain(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('No auth token found');
        return;
      }
  
      // ✅ FIXED: Use the correct endpoint with /contributions suffix
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/contributions/project/${project._id}/contributions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      setBlockchainData({
        currentFunding: response.data.currentFunding,
        fundingGoal: response.data.fundingGoal,
        isFullyFunded: response.data.isFullyFunded,
        contributorCount: response.data.contributorCount,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch blockchain data';
      console.error('Failed to fetch blockchain data:', message);
    } finally {
      setLoadingBlockchain(false);
    }
  }, [project._id]);

  // Fetch live blockchain data if project is on-chain
  useEffect(() => {
    if (project.blockchainProjectId !== null && project.blockchainProjectId !== undefined) {
      fetchBlockchainData();
    }
  }, [fetchBlockchainData, project.blockchainProjectId]);
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

  // Add this at the top of your ProjectCard component
useEffect(() => {
  // Catch any unhandled errors
  const handleError = (event: ErrorEvent) => {
    console.warn('Caught error:', event.error);
    event.preventDefault(); // Prevent debugger
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    console.warn('Caught promise rejection:', event.reason);
    event.preventDefault(); // Prevent debugger
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}, []);

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ElementType> = {
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

  // Use blockchain data if available, otherwise use database data
  const currentFunding = blockchainData 
    ? parseFloat(blockchainData.currentFunding) 
    : project.currentFunding;
    
  const fundingGoal = blockchainData 
    ? parseFloat(blockchainData.fundingGoal) 
    : project.fundingGoal;

  const isFullyFunded = blockchainData?.isFullyFunded || 
    (currentFunding >= fundingGoal && fundingGoal > 0);

  const fundingProgress = fundingGoal > 0 
    ? Math.min((currentFunding / fundingGoal) * 100, 100)
    : 0;

  const defaultImage = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';
  
  const projectImage = project.images && project.images.length > 0 
    ? project.images[0] 
    : defaultImage;

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={isFullyFunded ? 'purple.300' : borderColor}
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: isFullyFunded ? 'purple.400' : 'green.400',
      }}
      cursor="pointer"
      onClick={() => onViewDetails?.(project)}
      position="relative"
      boxShadow={isFullyFunded ? 'lg' : 'base'}
    >
      {/* Fully Funded Overlay Effect */}
      {isFullyFunded && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-br, purple.500, pink.500)"
          opacity={0.05}
          zIndex={0}
          pointerEvents="none"
        />
      )}

      {/* Project Image */}
      <AspectRatio ratio={16 / 9}>
        <Image
          src={projectImage}
          alt={project.title}
          objectFit="cover"
          fallbackSrc={defaultImage}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
          filter={isFullyFunded ? 'brightness(1.1)' : 'none'}
        />
      </AspectRatio>

      {/* Status Badge - Positioned over image */}
      <Box position="absolute" top={3} right={3} zIndex={1}>
        <Badge
          colorScheme={isFullyFunded ? 'purple' : getStatusColor(project.status)}
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={1}
          boxShadow="md"
          bg={badgeBg}
          fontWeight="bold"
        >
          <Icon 
            as={isFullyFunded ? FiAward : getStatusIcon(project.status)} 
            boxSize={3} 
          />
          {isFullyFunded ? '🎉 FULLY FUNDED' : getStatusLabel(project.status)}
        </Badge>
      </Box>

      {/* Blockchain Badge */}
      {showBlockchainInfo && project.blockchainStatus === 'created' && (
        <Box position="absolute" top={3} left={3} zIndex={1}>
          <Tooltip label="Live blockchain data" placement="top">
            <Badge
              colorScheme="blue"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={1}
              boxShadow="md"
              bg={badgeBg}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                fetchBlockchainData();
              }}
            >
              {loadingBlockchain ? (
                <Spinner size="xs" />
              ) : (
                <Icon as={FiDatabase} boxSize={3} />
              )}
              On-chain
            </Badge>
          </Tooltip>
        </Box>
      )}

      {/* Contributor Count Badge (if on blockchain) */}
      {blockchainData && blockchainData.contributorCount && blockchainData.contributorCount > 0 && (
        <Box position="absolute" bottom={3} right={3} zIndex={1}>
          <Badge
            colorScheme="green"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
            boxShadow="md"
            bg={badgeBg}
          >
            {blockchainData.contributorCount} {blockchainData.contributorCount === 1 ? 'Contributor' : 'Contributors'}
          </Badge>
        </Box>
      )}

      <CardBody p={5}>
        <VStack spacing={4} align="stretch">
          {/* Title */}
          <Box>
            <HStack justify="space-between" align="start" mb={2}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                noOfLines={2}
                lineHeight="1.3"
                color={titleColor}
              >
                {project.title}
              </Text>
              {project.blockchainProjectId !== null && (
                <Tooltip label="Refresh blockchain data" placement="top">
                  <IconButton
                    icon={loadingBlockchain ? <Spinner size="xs" /> : <FiRefreshCw />}
                    aria-label="Refresh"
                    size="xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchBlockchainData();
                    }}
                    isDisabled={loadingBlockchain}
                  />
                </Tooltip>
              )}
            </HStack>
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
              <HStack flex="1" justify="space-between" wrap="wrap">
                <HStack spacing={1}>
                  <Text 
                    color={isFullyFunded ? 'purple.600' : 'gray.600'} 
                    fontSize="xs"
                    fontWeight={isFullyFunded ? 'bold' : 'normal'}
                  >
                    {currentFunding.toFixed(4)}
                  </Text>
                  <Text color="purple.500" fontSize="xs" fontWeight="medium">
                    MATIC
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  <Text fontWeight="bold" color="green.600" fontSize="xs">
                    {fundingGoal.toFixed(4)}
                  </Text>
                  <Text color="purple.500" fontSize="xs" fontWeight="medium">
                    MATIC
                  </Text>
                </HStack>
              </HStack>
            </HStack>
          </VStack>

          {/* Funding Progress */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <HStack spacing={1}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                  Funding Progress
                </Text>
                {blockchainData && (
                  <Badge colorScheme="blue" fontSize="2xs">
                    Live
                  </Badge>
                )}
              </HStack>
              <Text 
                fontSize="xs" 
                fontWeight="bold" 
                color={isFullyFunded ? 'purple.600' : 'green.600'}
              >
                {fundingProgress.toFixed(1)}%
              </Text>
            </HStack>
            <Progress
              value={fundingProgress}
              size="sm"
              colorScheme={isFullyFunded ? 'purple' : 'green'}
              borderRadius="full"
              bg={progressBg}
              hasStripe={!isFullyFunded}
              isAnimated={!isFullyFunded}
            />
            {isFullyFunded && (
              <Box 
                mt={2} 
                p={2} 
                bg="purple.50" 
                borderRadius="md" 
                border="1px" 
                borderColor="purple.200"
              >
                <HStack justify="center" spacing={2}>
                  <Icon as={FiAward} color="purple.600" boxSize={4} />
                  <Text 
                    fontSize="xs" 
                    color="purple.700" 
                    fontWeight="bold" 
                    textAlign="center"
                  >
                    Goal Reached! Funds Released to Farmer
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <HStack spacing={2} pt={2}>
            <Button
              size="sm"
              colorScheme={isFullyFunded ? 'purple' : 'green'}
              leftIcon={<FiEye />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(project);
              }}
              flex="1"
            >
              {isFullyFunded ? 'View Success' : 'View Details'}
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
                colorScheme={isFullyFunded ? 'purple' : undefined}
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
                {project.blockchainProjectId !== null && (
                  <MenuItem
                    icon={<FiRefreshCw />}
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchBlockchainData();
                    }}
                  >
                    Refresh Blockchain Data
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