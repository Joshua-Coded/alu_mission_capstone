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
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
} from '@chakra-ui/react';
import { 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDatabase,
  FiLink,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ApiProject | null;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [fullProject, setFullProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<any>(null);
  const [refreshingBlockchain, setRefreshingBlockchain] = useState(false);
  const toast = useToast();

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
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to load project details',
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
  }, [project?._id, isOpen]);

  const fetchBlockchainStatus = async (projectId: string) => {
    try {
      setRefreshingBlockchain(true);
      const status = await projectApi.getBlockchainStatus(projectId);
      setBlockchainStatus(status);
    } catch (error: any) {
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
      
      toast({
        title: 'Synced Successfully',
        description: 'Blockchain data synchronized',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync with blockchain',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRefreshingBlockchain(false);
    }
  };

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
            <HStack spacing={4} fontSize="sm" color="gray.600">
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
              <Text color="gray.600">Loading project details...</Text>
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
                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Under Review</AlertTitle>
                          <AlertDescription>
                            Your project is being reviewed by government officials. You'll be notified once approved.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {fullProject.status === 'active' && (
                      <Alert status="success" borderRadius="lg">
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
                      <Alert status="error" borderRadius="lg">
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
                          <Text fontSize="sm" color="gray.600">Current / Goal</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            ${fullProject.currentFunding.toLocaleString()} / ${fullProject.fundingGoal.toLocaleString()}
                          </Text>
                        </HStack>
                        <Progress 
                          value={progressPercentage} 
                          colorScheme="green" 
                          size="lg" 
                          borderRadius="full"
                        />
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
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
                      <Stat bg="gray.50" p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Funding Goal</StatLabel>
                        <StatNumber fontSize="xl" color="green.600">
                          ${fullProject.fundingGoal.toLocaleString()}
                        </StatNumber>
                      </Stat>
                      <Stat bg="gray.50" p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Current Funding</StatLabel>
                        <StatNumber fontSize="xl" color="blue.600">
                          ${fullProject.currentFunding.toLocaleString()}
                        </StatNumber>
                      </Stat>
                      <Stat bg="gray.50" p={4} borderRadius="lg">
                        <StatLabel fontSize="xs">Contributors</StatLabel>
                        <StatNumber fontSize="xl">{fullProject.contributorsCount}</StatNumber>
                      </Stat>
                      <Stat bg="gray.50" p={4} borderRadius="lg">
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
                          <Icon as={FiMapPin} color="green.500" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Location</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.location}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack>
                          <Icon as={FiCalendar} color="purple.500" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Timeline</Text>
                            <Text fontSize="sm" fontWeight="medium">{fullProject.timeline}</Text>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiDatabase} color="blue.500" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Category</Text>
                            <Badge colorScheme="blue">{fullProject.category.replace(/_/g, ' ')}</Badge>
                          </VStack>
                        </HStack>

                        <HStack>
                          <Icon as={FiClock} color="orange.500" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500">Created</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {new Date(fullProject.createdAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>

                        {fullProject.blockchainProjectId !== undefined && (
                          <HStack>
                            <Icon as={FiDatabase} color="blue.500" boxSize={5} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" color="gray.500">Blockchain ID</Text>
                              <Badge colorScheme="blue" fontSize="sm">
                                #{fullProject.blockchainProjectId}
                              </Badge>
                            </VStack>
                          </HStack>
                        )}
                      </SimpleGrid>
                    </Box>

                    {fullProject.farmer && typeof fullProject.farmer !== 'string' && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontWeight="bold" mb={4} fontSize="lg">
                            Farmer Information
                          </Text>
                          <VStack align="start" spacing={3} bg="gray.50" p={4} borderRadius="lg">
                            <HStack>
                              <Text fontSize="sm" fontWeight="medium" color="gray.600">Name:</Text>
                              <Text fontSize="sm">{fullProject.farmer.firstName} {fullProject.farmer.lastName}</Text>
                            </HStack>
                            <HStack>
                              <Text fontSize="sm" fontWeight="medium" color="gray.600">Email:</Text>
                              <Text fontSize="sm">{fullProject.farmer.email}</Text>
                            </HStack>
                            {fullProject.farmer.phoneNumber && (
                              <HStack>
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">Phone:</Text>
                                <Text fontSize="sm">{fullProject.farmer.phoneNumber}</Text>
                              </HStack>
                            )}
                            {fullProject.farmer.walletAddress && (
                              <VStack align="start" spacing={1} w="full">
                                <Text fontSize="sm" fontWeight="medium" color="gray.600">Wallet Address:</Text>
                                <Code fontSize="xs" p={2} w="full">
                                  {fullProject.farmer.walletAddress}
                                </Code>
                              </VStack>
                            )}
                          </VStack>
                        </Box>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                {/* Blockchain Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg">
                        Blockchain Information
                      </Text>
                      <HStack spacing={2}>
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
                        <Alert status="success" borderRadius="lg">
                          <AlertIcon />
                          <Box flex="1">
                            <AlertTitle>On Blockchain ⛓️</AlertTitle>
                            <AlertDescription>
                              Your project has been successfully created on the Ethereum blockchain
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Stat bg="blue.50" p={4} borderRadius="lg">
                            <StatLabel>Blockchain ID</StatLabel>
                            <StatNumber fontSize="2xl" color="blue.600">
                              #{fullProject.blockchainProjectId}
                            </StatNumber>
                          </Stat>

                          <Stat bg="green.50" p={4} borderRadius="lg">
                            <StatLabel>Status</StatLabel>
                            <StatNumber>
                              <Badge colorScheme="green" fontSize="md">Active</Badge>
                            </StatNumber>
                          </Stat>

                          {fullProject.blockchainCreatedAt && (
                            <Stat bg="purple.50" p={4} borderRadius="lg">
                              <StatLabel>Created On</StatLabel>
                              <StatNumber fontSize="sm">
                                {new Date(fullProject.blockchainCreatedAt).toLocaleDateString()}
                              </StatNumber>
                            </Stat>
                          )}

                          {fullProject.blockchainTxHash && (
                            <Stat bg="gray.50" p={4} borderRadius="lg">
                              <StatLabel>Transaction</StatLabel>
                              <Link
                                href={`https://sepolia.etherscan.io/tx/${fullProject.blockchainTxHash}`}
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
                                View on Etherscan
                              </Link>
                            </Stat>
                          )}
                        </SimpleGrid>

                        {blockchainStatus && (
                          <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                            <Text fontWeight="bold" mb={3}>Live Blockchain Data</Text>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                              <HStack justify="space-between">
                                <Text fontSize="sm">On-chain Funding:</Text>
                                <Badge colorScheme="green">{blockchainStatus.totalFunding || '0'} ETH</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Funding Goal:</Text>
                                <Badge>{blockchainStatus.fundingGoal || '0'} ETH</Badge>
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
                      <Alert status="error" borderRadius="lg">
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Blockchain Creation Failed</AlertTitle>
                          <AlertDescription>
                            Project exists locally but could not be created on blockchain. Contact support.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : fullProject.blockchainStatus === 'pending' ? (
                      <Alert status="warning" borderRadius="lg">
                        <AlertIcon />
                        <Box flex="1">
                          <AlertTitle>Creating on Blockchain...</AlertTitle>
                          <AlertDescription>
                            Your project is being created on the blockchain. This may take a few minutes.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <Alert status="info" borderRadius="lg">
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
                            bg="gray.50" 
                            borderRadius="lg"
                            border="1px"
                            borderColor="gray.200"
                            _hover={{ bg: 'gray.100', borderColor: 'green.300' }}
                            transition="all 0.2s"
                          >
                            <HStack justify="space-between">
                              <HStack spacing={3}>
                                <Icon as={FiFileText} color="blue.500" boxSize={5} />
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {doc.name || 'Unnamed Document'}
                                  </Text>
                                  <HStack spacing={3} fontSize="xs" color="gray.500">
                                    <Text>
                                      {doc.name?.split('.')?.pop()?.toUpperCase() || 'FILE'}
                                    </Text>
                                    {(doc as any).uploadedAt && (
                                      <Text>
                                        {new Date((doc as any).uploadedAt).toLocaleDateString()}
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
                      <Box p={8} textAlign="center" bg="gray.50" borderRadius="lg">
                        <Icon as={FiFileText} boxSize={12} color="gray.400" mb={3} />
                        <Text color="gray.600" fontSize="sm">
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