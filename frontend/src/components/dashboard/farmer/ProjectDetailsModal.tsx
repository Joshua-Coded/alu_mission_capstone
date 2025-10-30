import React, { useEffect, useState } from "react";
import { Project as ApiProject, projectApi } from "../../../lib/projectApi";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Image,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
  Spinner,
  useToast,
  Icon,
  List,
  ListItem,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers,
  FiClock,
  FiFileText,
  FiDatabase,
  FiLink,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi';

// Define proper types for blockchain status
interface BlockchainStatus {
  totalFunding?: number | string;
  fundingGoal?: number | string;
  isFunded?: boolean;
  canComplete?: boolean;
}

// Define proper type for verified by field
interface VerifiedBy {
  firstName?: string;
  lastName?: string;
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ApiProject | null;
  onProjectUpdate?: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdate
}) => {
  const [fullProject, setFullProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [refreshingBlockchain, setRefreshingBlockchain] = useState(false);
  const toast = useToast();

  // Move all useColorModeValue hooks to the top - unconditionally
  const statBgColor = useColorModeValue('gray.50', 'gray.700');
  const alertBgColors = {
    info: useColorModeValue('blue.50', 'blue.900'),
    success: useColorModeValue('green.50', 'green.900'),
    error: useColorModeValue('red.50', 'red.900'),
    warning: useColorModeValue('orange.50', 'orange.900'),
  };
  const blockchainStatBgColors = {
    blue: useColorModeValue('blue.50', 'blue.900'),
    green: useColorModeValue('green.50', 'green.900'),
    purple: useColorModeValue('purple.50', 'purple.900'),
    gray: useColorModeValue('gray.50', 'gray.700'),
  };
  const documentBgColor = useColorModeValue('gray.50', 'gray.700');
  const documentHoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const documentBorderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const iconColors = {
    green: useColorModeValue('green.500', 'green.300'),
    purple: useColorModeValue('purple.500', 'purple.300'),
    blue: useColorModeValue('blue.500', 'blue.300'),
    orange: useColorModeValue('orange.500', 'orange.300'),
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (project?._id && isOpen) {
        setIsLoading(true);
        try {
          const data = await projectApi.getProjectById(project._id);
          setFullProject(data);
          
          if (data.blockchainStatus === 'created') {
            fetchBlockchainStatus(data._id);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load project details';
          toast({
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?._id, isOpen]);

  const fetchBlockchainStatus = async (projectId: string) => {
    try {
      setRefreshingBlockchain(true);
      const status = await projectApi.getBlockchainStatus(projectId);
      setBlockchainStatus(status);
    } catch (error) {
      console.error('Failed to fetch blockchain status:', error);
    } finally {
      setRefreshingBlockchain(false);
    }
  };

  const handleRefreshBlockchain = async () => {
    if (fullProject) {
      await fetchBlockchainStatus(fullProject._id);
      toast({
        title: 'Refreshed',
        description: 'Blockchain status updated',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleSyncBlockchain = async () => {
    if (!fullProject) return;
    
    try {
      setRefreshingBlockchain(true);
      await projectApi.syncBlockchainStatus(fullProject._id);
      
      const updatedData = await projectApi.getProjectById(fullProject._id);
      setFullProject(updatedData);
      
      if (onProjectUpdate) {
        onProjectUpdate();
      }
      
      toast({
        title: 'Synced Successfully',
        description: 'Blockchain data synchronized',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync with blockchain';
      toast({
        title: 'Sync Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRefreshingBlockchain(false);
    }
  };

  // Early return must come AFTER all hooks
  if (!project) return null;

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

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isOnBlockchain = fullProject?.blockchainStatus === 'created';
  const progressPercentage = fullProject 
    ? Math.min((fullProject.currentFunding / fullProject.fundingGoal) * 100, 100)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent maxH="90vh">
        <ModalHeader borderBottom="1px" borderColor="gray.200">
          <VStack align="start" spacing={2}>
            <HStack spacing={3} wrap="wrap">
              <Text fontSize="xl" fontWeight="bold">{project.title}</Text>
              {fullProject && (
                <>
                  <Badge colorScheme={getStatusColor(fullProject.status)} fontSize="sm" px={3} py={1}>
                    {getStatusLabel(fullProject.status)}
                  </Badge>
                  {isOnBlockchain && (
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                      <HStack spacing={1}>
                        <Icon as={FiDatabase} boxSize={3} />
                        <Text>On Blockchain</Text>
                      </HStack>
                    </Badge>
                  )}
                </>
              )}
            </HStack>
            <HStack spacing={4} fontSize="sm" color={textColor}>
              <HStack>
                <Icon as={FiMapPin} />
                <Text>{project.location}</Text>
              </HStack>
              <HStack>
                <Icon as={FiCalendar} />
                <Text>{project.timeline}</Text>
              </HStack>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          {isLoading ? (
            <VStack spacing={4} py={12}>
              <Spinner size="xl" color="green.500" thickness="4px" />
              <Text color={textColor}>Loading project details...</Text>
            </VStack>
          ) : fullProject ? (
            <Tabs variant="enclosed" colorScheme="green">
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Details</Tab>
                <Tab>Blockchain</Tab>
                <Tab>Documents</Tab>
              </TabList>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Status Alerts */}
                    {fullProject.status === 'submitted' && (
                      <Alert status="info" borderRadius="lg" bg={alertBgColors.info}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Under Review</AlertTitle>
                          <AlertDescription>
                            Your project is being reviewed by government officials. You&apos;ll be notified once approved.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {fullProject.status === 'active' && (
                      <Alert status="success" borderRadius="lg" bg={alertBgColors.success}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Project Approved ✓</AlertTitle>
                          <AlertDescription>
                            Your project is active and accepting contributions from investors.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {fullProject.blockchainStatus === 'failed' && (
                      <Alert status="error" borderRadius="lg" bg={alertBgColors.error}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Blockchain Error</AlertTitle>
                          <AlertDescription>
                            Project exists locally but failed to create on blockchain. Contact support.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {/* Funding Progress */}
                    <Box>
                      <Text fontWeight="bold" mb={3} fontSize="lg" color="green.600">
                        Funding Progress
                      </Text>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>Current / Goal</Text>
                          <HStack spacing={2}>
                            <Text fontSize="lg" fontWeight="bold" color="purple.600">
                              {fullProject.currentFunding.toFixed(4)}
                            </Text>
                            <Text fontSize="md" color="purple.500">
                              /
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                              {fullProject.fundingGoal.toFixed(4)}
                            </Text>
                            <Text fontSize="md" fontWeight="bold" color="purple.500">
                              MATIC
                            </Text>
                          </HStack>
                        </HStack>
                        <Progress 
                          value={progressPercentage} 
                          colorScheme="green" 
                          size="lg" 
                          borderRadius="full"
                        />
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={textColor}>
                            {progressPercentage.toFixed(1)}% funded
                          </Text>
                          <Badge colorScheme={progressPercentage >= 100 ? 'green' : 'blue'}>
                            {progressPercentage >= 100 ? 'Fully Funded' : 'In Progress'}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Key Stats */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <Stat bg={statBgColor} p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Funding Goal</StatLabel>
                        <StatNumber fontSize="lg" color="green.600">
                          {fullProject.fundingGoal.toFixed(4)}
                        </StatNumber>
                        <StatHelpText fontSize="xs" color="purple.500">MATIC</StatHelpText>
                      </Stat>
                      <Stat bg={statBgColor} p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Current Funding</StatLabel>
                        <StatNumber fontSize="lg" color="purple.600">
                          {fullProject.currentFunding.toFixed(4)}
                        </StatNumber>
                        <StatHelpText fontSize="xs" color="purple.500">MATIC</StatHelpText>
                      </Stat>
                      <Stat bg={statBgColor} p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Contributors</StatLabel>
                        <StatNumber fontSize="xl">{fullProject.contributorsCount}</StatNumber>
                      </Stat>
                      <Stat bg={statBgColor} p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Progress</StatLabel>
                        <StatNumber fontSize="xl" color="purple.600">
                          {Math.round(progressPercentage)}%
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>

                    {/* Project Images */}
                    {fullProject.images && fullProject.images.length > 0 && (
                      <Box>
                        <Text fontWeight="bold" mb={3} fontSize="lg">
                          Project Images
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {fullProject.images.map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`${fullProject.title} ${index + 1}`}
                              borderRadius="lg"
                              w="full"
                              h="250px"
                              objectFit="cover"
                              border="1px"
                              borderColor="gray.200"
                            />
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}

                    {/* Description */}
                    <Box>
                      <Text fontWeight="bold" mb={3} fontSize="lg">
                        Description
                      </Text>
                      <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap" lineHeight="tall">
                        {fullProject.description}
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Details Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontWeight="bold" mb={4} fontSize="lg">
                        Project Information
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <HStack>
                          <Icon as={FiMapPin} color={iconColors.green} boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={textColor}>Location</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.location}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack>
                          <Icon as={FiCalendar} color={iconColors.purple} boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={textColor}>Timeline</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.timeline}</Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiDatabase} color={iconColors.blue} boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={textColor}>Category</Text>
                            <Badge colorScheme="blue">{fullProject.category.replace(/_/g, ' ')}</Badge>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiClock} color={iconColors.orange} boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={textColor}>Created</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {new Date(fullProject.createdAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiDollarSign} color={iconColors.green} boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={textColor}>Funding Goal</Text>
                            <HStack spacing={1}>
                              <Text fontSize="sm" fontWeight="bold" color="green.600">
                                {fullProject.fundingGoal.toFixed(4)}
                              </Text>
                              <Text fontSize="xs" color="purple.500">
                                MATIC
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiUsers} color={iconColors.blue} boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color={textColor}>Contributors</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.contributorsCount} people</Text>
                          </VStack>
                        </HStack>
                      </SimpleGrid>
                    </Box>

                    <Divider />

                    {/* Verification Status */}
                    {fullProject.verification && (
                      <Box>
                        <Text fontWeight="bold" mb={3} fontSize="lg">
                          Verification Status
                        </Text>
                        {fullProject.verification.verifiedBy ? (
                          <Alert status="success" borderRadius="lg" bg={alertBgColors.success}>
                            <AlertIcon />
                            <Box flex="1">
                              <AlertTitle>Government Verified ✓</AlertTitle>
                              <AlertDescription>
                                Verified by: {typeof fullProject.verification.verifiedBy === 'string' 
                                  ? fullProject.verification.verifiedBy 
                                  : `${(fullProject.verification.verifiedBy as VerifiedBy)?.firstName || ''} ${(fullProject.verification.verifiedBy as VerifiedBy)?.lastName || ''}`.trim() || 'Official'}
                                {fullProject.verification.verifiedAt && (
                                  <Text fontSize="xs" mt={1}>
                                    Verified on: {new Date(fullProject.verification.verifiedAt).toLocaleDateString()}
                                  </Text>
                                )}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        ) : (
                          <Alert status="warning" borderRadius="lg" bg={alertBgColors.warning}>
                            <AlertIcon />
                            <Box flex="1">
                              <AlertTitle>Pending Verification</AlertTitle>
                              <AlertDescription>
                                This project is awaiting government verification.
                              </AlertDescription>
                            </Box>
                          </Alert>
                        )}
                      </Box>
                    )}
                  </VStack>
                </TabPanel>

                {/* Blockchain Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <HStack justify="space-between" align="center">
                      <Text fontWeight="bold" fontSize="lg">
                        Blockchain Information
                      </Text>
                      <HStack>
                        <Button
                          size="sm"
                          leftIcon={<FiRefreshCw />}
                          onClick={handleRefreshBlockchain}
                          isLoading={refreshingBlockchain}
                          variant="outline"
                        >
                          Refresh
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FiDatabase />}
                          onClick={handleSyncBlockchain}
                          isLoading={refreshingBlockchain}
                          colorScheme="blue"
                        >
                          Sync
                        </Button>
                      </HStack>
                    </HStack>

                    {isOnBlockchain ? (
                      <VStack spacing={4} align="stretch">
                        <Alert status="success" borderRadius="lg" bg={alertBgColors.success}>
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle>On Blockchain ⛓️</AlertTitle>
                            <AlertDescription>
                              Your project has been successfully created on the Polygon blockchain
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Stat bg={blockchainStatBgColors.blue} p={4} borderRadius="lg">
                            <StatLabel>Blockchain ID</StatLabel>
                            <StatNumber fontSize="2xl" color="blue.600">
                              #{fullProject.blockchainProjectId}
                            </StatNumber>
                          </Stat>

                          <Stat bg={blockchainStatBgColors.green} p={4} borderRadius="lg">
                            <StatLabel>Status</StatLabel>
                            <StatNumber>
                              <Badge colorScheme="green" fontSize="md">Active</Badge>
                            </StatNumber>
                          </Stat>

                          {fullProject.blockchainCreatedAt && (
                            <Stat bg={blockchainStatBgColors.purple} p={4} borderRadius="lg">
                              <StatLabel>Created On</StatLabel>
                              <StatNumber fontSize="sm">
                                {new Date(fullProject.blockchainCreatedAt).toLocaleDateString()}
                              </StatNumber>
                            </Stat>
                          )}

                          {fullProject.blockchainTxHash && (
                            <Stat bg={blockchainStatBgColors.gray} p={4} borderRadius="lg">
                              <StatLabel>Transaction</StatLabel>
                              <Link
                                href={`https://polygonscan.com/tx/${fullProject.blockchainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="blue.600"
                                fontSize="sm"
                                display="flex"
                                alignItems="center"
                                gap={1}
                                _hover={{ textDecoration: 'underline' }}
                              >
                                <FiLink size={14} />
                                View on Polygonscan
                              </Link>
                            </Stat>
                          )}
                        </SimpleGrid>

                        {blockchainStatus && (
                          <Box p={4} bg={blockchainStatBgColors.purple} borderRadius="lg" border="1px" borderColor="purple.200">
                            <Text fontWeight="bold" mb={3}>Live Blockchain Data</Text>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                              <HStack justify="space-between">
                                <Text fontSize="sm">On-chain Funding:</Text>
                                <Badge colorScheme="purple">{blockchainStatus.totalFunding || '0'} MATIC</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Funding Goal:</Text>
                                <Badge colorScheme="green">{blockchainStatus.fundingGoal || '0'} MATIC</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Fully Funded:</Text>
                                <Badge colorScheme={blockchainStatus.isFunded ? 'green' : 'yellow'}>
                                  {blockchainStatus.isFunded ? 'Yes' : 'No'}
                                </Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Can Complete:</Text>
                                <Badge colorScheme={blockchainStatus.canComplete ? 'green' : 'gray'}>
                                  {blockchainStatus.canComplete ? 'Yes' : 'No'}
                                </Badge>
                              </HStack>
                            </SimpleGrid>
                          </Box>
                        )}
                      </VStack>
                    ) : fullProject.blockchainStatus === 'failed' ? (
                      <Alert status="error" borderRadius="lg" bg={alertBgColors.error}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Blockchain Creation Failed</AlertTitle>
                          <AlertDescription>
                            Project exists locally but could not be created on blockchain. Contact support.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : fullProject.blockchainStatus === 'pending' ? (
                      <Alert status="warning" borderRadius="lg" bg={alertBgColors.warning}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Creating on Blockchain...</AlertTitle>
                          <AlertDescription>
                            Your project is being created on the blockchain. This may take a few minutes.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <Alert status="info" borderRadius="lg" bg={alertBgColors.info}>
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Not on Blockchain Yet</AlertTitle>
                          <AlertDescription>
                            Project will be created on blockchain after government verification.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* Documents Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold" fontSize="lg">
                      Project Documents
                    </Text>
                    
                    {fullProject.documents && fullProject.documents.length > 0 ? (
                      <List spacing={3}>
                        {fullProject.documents.map((doc, index) => (
                          <ListItem 
                            key={index} 
                            p={4} 
                            bg={documentBgColor}
                            borderRadius="lg"
                            border="1px"
                            borderColor={documentBorderColor}
                            _hover={{ bg: documentHoverBgColor, borderColor: 'green.300' }}
                            transition="all 0.2s"
                          >
                            <HStack justify="space-between">
                              <HStack spacing={3}>
                                <Icon as={FiFileText} color={iconColors.blue} boxSize={5} />
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {doc.name || 'Unnamed Document'}
                                  </Text>
                                  <HStack spacing={3} fontSize="xs" color={textColor}>
                                    <Text>
                                      {doc.name?.split('.')?.pop()?.toUpperCase() || 'FILE'}
                                    </Text>
                                    {(doc as { uploadedAt?: string }).uploadedAt && (
                                      <Text>
                                        {new Date((doc as { uploadedAt: string }).uploadedAt).toLocaleDateString()}
                                      </Text>
                                    )}
                                  </HStack>
                                </VStack>
                              </HStack>
                              <Button
                                as="a"
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                colorScheme="green"
                                leftIcon={<FiDownload />}
                                isDisabled={!doc.url}
                              >
                                Download
                              </Button>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box p={8} textAlign="center" bg={documentBgColor} borderRadius="lg">
                        <Icon as={FiFileText} boxSize={12} color="gray.400" mb={3} />
                        <Text color={textColor} fontSize="sm">
                          No documents uploaded for this project
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Text>No project data available</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProjectDetailsModal;