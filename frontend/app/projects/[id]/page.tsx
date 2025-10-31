"use client";
import ContributionModal from "@/components/dashboard/contributor/ContributionModal";
import ProjectSuccessView from "../../../src/components/dashboard/farmer/ProjectSuccessView";
import RouteGuard from "@/components/RouteGuard";
import contributionApi from "@/lib/contributionApi";
import { Flex, useDisclosure } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Contribution } from "@/lib/contributionApi";
import type { ProjectContributionInfo } from "@/lib/contributionApi";
import { projectApi, type Project } from "@/lib/projectApi";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  useToast,
  useColorModeValue,
  Button,
  Badge,
  Image,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Progress,
  Divider,
  AspectRatio,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Link,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiHeart,
  FiCheckCircle,
  FiShield,
  FiExternalLink,
  FiUsers,
  FiRefreshCw,
  FiDollarSign,
  FiDatabase,
} from 'react-icons/fi';

// Create a separate component for ContributionCard to fix hook-in-callback error
const ContributionCard = ({ contribution, index }: { contribution: Contribution; index: number }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  
  // Safely extract data with fallbacks
  const contributorName = contribution.contributor 
    ? `${contribution.contributor.firstName || ''} ${contribution.contributor.lastName || ''}`.trim()
    : contribution.contributor || 'Anonymous Contributor';
  
  const amount = contribution.amountMatic || contribution.amount || 0;
  const date = contribution.contributedAt || contribution.createdAt;
  
  // Safe date formatting
  let formattedDate = 'Invalid Date';
  try {
    if (date) {
      const validDate = new Date(date);
      if (!isNaN(validDate.getTime())) {
        formattedDate = validDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  } catch (error) {
    console.error('Date formatting error:', error);
  }

  const formatMatic = (amount: string | number) => {
    if (typeof amount === 'string' && amount.includes('.')) {
      return amount;
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.0000';
    return num.toFixed(4);
  };

  return (
    <Card key={contribution._id || index} bg={cardBg}>
      <CardBody>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Box
              w={10}
              h={10}
              bg="purple.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              color="purple.600"
            >
              {index + 1}
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">
                {contributorName || 'Anonymous'}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {formattedDate}
              </Text>
              {contribution.transactionHash && (
                <Text fontSize="xs" color="blue.600" fontFamily="mono">
                  TX: {contribution.transactionHash.slice(0, 10)}...
                </Text>
              )}
            </VStack>
          </HStack>
          <VStack align="end" spacing={0}>
            <HStack>
              <Text fontWeight="bold" color="purple.600">
                {formatMatic(amount)}
              </Text>
              <Text fontWeight="bold" color="purple.500">MATIC</Text>
            </HStack>
            <Badge 
              colorScheme={
                contribution.status === 'confirmed' ? 'green' : 
                contribution.status === 'pending' ? 'yellow' : 'gray'
              } 
              fontSize="xs"
            >
              {contribution.status ? contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1) : 'Confirmed'}
            </Badge>
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [blockchainData, setBlockchainData] = useState<ProjectContributionInfo | null>(null);
  const [loadingBlockchain, setLoadingBlockchain] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  // const [lastUpdated] = useState<string>('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const overviewCardBg = useColorModeValue('gray.50', 'gray.700');
  const blockchainCardBg = useColorModeValue('purple.50', 'purple.900');
  const farmerCardBg = useColorModeValue('green.50', 'green.900');
  const fundingCardBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Wrap all functions in useCallback to prevent infinite re-renders
  const fetchBlockchainData = useCallback(async (projectId: string) => {
    try {
      setLoadingBlockchain(true);
      const result = await contributionApi.getProjectContributionInfo(projectId);
      
      if (result.success && result.data) {
        setBlockchainData(result.data);
      } else if (result.error?.includes('rate limit') || result.error?.includes('blockchain')) {
        console.warn('Blockchain rate limit reached - using fallback data');
        // Use basic project data as fallback
        setBlockchainData(null);
        toast({
          title: 'Blockchain Data Limited',
          description: 'Real-time blockchain data is temporarily unavailable. Showing basic project information.',
          status: 'warning',
          duration: 5000,
        });
      } else {
        console.warn('Blockchain data not available:', result.error);
        setBlockchainData(null);
      }
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
      setBlockchainData(null);
    } finally {
      setLoadingBlockchain(false);
    }
  }, [toast]);

  const fetchContributions = useCallback(async (projectId: string) => {
    try {
      const result = await contributionApi.getProjectContributions(projectId);
      
      console.log('📊 Contributions Result:', result);
      
      if (result.success && result.data) {
        console.log('✅ Contributions:', result.data.contributions);
        const fetchedContributions = result.data.contributions || [];
        const contributorCount = result.data.contributorCount || fetchedContributions.length || 0;
        
        setContributions(fetchedContributions);
        
        // ✅ FIX: Use functional setState with proper type checking
        setProject(prevProject => {
          if (!prevProject) return prevProject;
          return {
            ...prevProject,
            contributorsCount: contributorCount,
          };
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch contributions:', error);
      setContributions([]);
    }
  }, []); // ✅ Empty dependencies array

// ✅ fetchProject now works correctly
const fetchProject = useCallback(async (id: string) => {
  try {
    setLoading(true);
    const data = await projectApi.getProjectById(id);
    setProject(data);
    
    // Fetch blockchain data if project is on-chain
    if (data.blockchainProjectId !== null && data.blockchainProjectId !== undefined) {
      await fetchBlockchainData(id);
      await fetchContributions(id);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load project';
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setLoading(false);
  }
}, [toast, fetchBlockchainData, fetchContributions]);

  const checkIfFavorite = useCallback(async (id: string) => {
    try {
      const result = await projectApi.isFavorite(id);
      setIsFavorite(result.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string);
      checkIfFavorite(params.id as string);
    }
  }, [params.id, fetchProject, checkIfFavorite]);

  const toggleFavorite = async () => {
    if (!project) return;

    try {
      if (isFavorite) {
        await projectApi.removeFromFavorites(project._id);
        setIsFavorite(false);
        toast({
          title: 'Removed from favorites',
          status: 'success',
          duration: 3000,
        });
      } else {
        await projectApi.addToFavorites(project._id);
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update favorites',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const formatMatic = (amount: string | number) => {
    if (typeof amount === 'string' && amount.includes('.')) {
      return amount;
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.0000';
    return num.toFixed(4);
  };

  // formatDate function since it was unused

  const calculateProgress = () => {
    if (!blockchainData) {
      // Fallback to database values
      if (!project) return 0;
      return (project.currentFunding / project.fundingGoal) * 100;
    }
    
    const current = parseFloat(blockchainData.currentFunding);
    const goal = parseFloat(blockchainData.fundingGoal);
    if (goal === 0) return 0;
    return (current / goal) * 100;
  };

  const getCurrentFunding = () => {
    if (blockchainData) {
      const funding = parseFloat(blockchainData.currentFunding);
      return isNaN(funding) ? 0 : funding;
    }
    return project?.currentFunding || 0;
  };

  const getFundingGoal = () => {
    if (blockchainData) {
      const goal = parseFloat(blockchainData.fundingGoal);
      return isNaN(goal) ? 0 : goal;
    }
    return project?.fundingGoal || 0;
  };

  const isFullyFunded = blockchainData?.isFullyFunded || 
    (getCurrentFunding() >= getFundingGoal() && getFundingGoal() > 0);

  // Early return must come AFTER all hooks
  if (loading) {
    return (
      <RouteGuard allowedRoles={['INVESTOR', 'FARMER', 'GOVERNMENT_OFFICIAL']}>
        <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.600">Loading project...</Text>
          </VStack>
        </Box>
      </RouteGuard>
    );
  }

  if (!project) {
    return (
      <RouteGuard allowedRoles={['INVESTOR', 'FARMER', 'GOVERNMENT_OFFICIAL']}>
        <Box minH="100vh" bg={bgColor} py={8}>
          <Container maxW="5xl">
            <VStack spacing={4} py={20}>
              <Text fontSize="lg" color="gray.600">Project not found</Text>
              <Button onClick={() => router.push('/projects/active')}>
                Browse Projects
              </Button>
            </VStack>
          </Container>
        </Box>
      </RouteGuard>
    );
  }

  const progress = calculateProgress();
  const currentFunding = getCurrentFunding();
  const fundingGoal = getFundingGoal();

  // Get status color and label like the farmer modal
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

  const isOnBlockchain = project.blockchainStatus === 'created';

  return (
    <RouteGuard allowedRoles={['INVESTOR', 'FARMER', 'GOVERNMENT_OFFICIAL']}>
      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="6xl">
          <VStack spacing={8} align="stretch">
            {/* Back Button */}
            <HStack justify="space-between">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => router.back()}
              >
                Back
              </Button>

              <HStack spacing={2}>
                <Button
                  leftIcon={<Icon as={FiRefreshCw} />}
                  variant="outline"
                  onClick={() => {
                    if (params.id) {
                      fetchProject(params.id as string);
                      toast({
                        title: 'Refreshing...',
                        status: 'info',
                        duration: 2000,
                      });
                    }
                  }}
                  isLoading={loading || loadingBlockchain}
                >
                  Refresh
                </Button>
                
                <Button
                  leftIcon={<Icon as={FiHeart} />}
                  colorScheme={isFavorite ? 'red' : 'gray'}
                  variant={isFavorite ? 'solid' : 'outline'}
                  onClick={toggleFavorite}
                >
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                {!isFullyFunded && (
                  <Button colorScheme="green" onClick={onOpen}>
                    Contribute Now
                  </Button>
                )}
              </HStack>
            </HStack>

            {/* Project Images */}
            {project.images && project.images.length > 0 && (
              <AspectRatio ratio={16 / 9} maxH="400px">
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  objectFit="cover"
                  borderRadius="lg"
                  fallbackSrc="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80"
                />
              </AspectRatio>
            )}

            {/* Project Header - Improved like farmer modal */}
            <Box>
              <HStack spacing={3} mb={4} wrap="wrap">
                <Text fontSize="2xl" fontWeight="bold">{project.title}</Text>
                {project && (
                  <>
                    <Badge colorScheme={getStatusColor(project.status)} fontSize="sm" px={3} py={1}>
                      {getStatusLabel(project.status)}
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
              <HStack spacing={4} fontSize="sm" color={textColor} mb={4}>
                <HStack>
                  <Icon as={FiMapPin} />
                  <Text>{project.location}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCalendar} />
                  <Text>{project.timeline}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiDollarSign} />
                  <Text>{project.category.replace(/_/g, ' ')}</Text>
                </HStack>
              </HStack>
              <Text fontSize="lg" color="gray.600" lineHeight="tall" whiteSpace="pre-wrap">
                {project.description}
              </Text>
            </Box>

            {/* Funding Progress Card - Improved like farmer modal */}
            {isFullyFunded ? (
              <Card bg={cardBg} borderWidth="2px" borderColor="purple.300" shadow="lg">
                <CardBody>
                  {blockchainData ? (
                    <ProjectSuccessView
                      project={project}
                      blockchainData={{
                        currentFunding: blockchainData.currentFunding,
                        fundingGoal: blockchainData.fundingGoal,
                        contributorCount: blockchainData.contributorCount,
                        isFullyFunded: blockchainData.isFullyFunded
                      }}
                    />
                  ) : (
                    <VStack spacing={4} py={8}>
                      <Icon as={FiCheckCircle} boxSize={12} color="green.500" />
                      <Text fontSize="xl" fontWeight="bold" color="green.600">
                        🎉 Project Fully Funded!
                      </Text>
                      <Text color="gray.600" textAlign="center">
                        This project has reached its funding goal.
                        {loadingBlockchain ? ' Loading blockchain data...' : ' Waiting for blockchain confirmation.'}
                      </Text>
                      {loadingBlockchain && (
                        <Spinner size="md" color="green.500" />
                      )}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            ) : (
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold" mb={3} fontSize="lg" color="green.600">
                      Funding Progress
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColor}>Current / Goal</Text>
                        <HStack spacing={2}>
                          <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            {formatMatic(currentFunding)}
                          </Text>
                          <Text fontSize="md" color="purple.500">/</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {formatMatic(fundingGoal)}
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="purple.500">MATIC</Text>
                        </HStack>
                      </HStack>
                      <Progress 
                        value={progress} 
                        colorScheme="green" 
                        size="lg" 
                        borderRadius="full"
                      />
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColor}>
                          {progress.toFixed(1)}% funded
                        </Text>
                        <Badge colorScheme={progress >= 100 ? 'green' : 'blue'}>
                          {progress >= 100 ? 'Fully Funded' : 'In Progress'}
                        </Badge>
                      </HStack>
                    </VStack>

                    {/* Key Stats like farmer modal */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={4}>
                      <Card bg={overviewCardBg} p={3}>
                        <VStack spacing={1}>
                          <Text fontSize="xs" color={textColor}>Funding Goal</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {formatMatic(fundingGoal)}
                          </Text>
                          <Text fontSize="xs" color="purple.500">MATIC</Text>
                        </VStack>
                      </Card>
                      <Card bg={overviewCardBg} p={3}>
                        <VStack spacing={1}>
                          <Text fontSize="xs" color={textColor}>Current Funding</Text>
                          <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            {formatMatic(currentFunding)}
                          </Text>
                          <Text fontSize="xs" color="purple.500">MATIC</Text>
                        </VStack>
                      </Card>
                      <Card bg={overviewCardBg} p={3}>
                        <VStack spacing={1}>
                          <Text fontSize="xs" color={textColor}>Contributors</Text>
                          <Text fontSize="xl" fontWeight="bold">{contributions.length}</Text>
                        </VStack>
                      </Card>
                      <Card bg={overviewCardBg} p={3}>
                        <VStack spacing={1}>
                          <Text fontSize="xs" color={textColor}>Progress</Text>
                          <Text fontSize="xl" fontWeight="bold" color="purple.600">
                            {Math.round(progress)}%
                          </Text>
                        </VStack>
                      </Card>
                    </SimpleGrid>

                    <Button
                      colorScheme="green"
                      size="lg"
                      w="full"
                      onClick={onOpen}
                      isDisabled={progress >= 100 || !blockchainData?.isActive}
                      mt={4}
                    >
                      {progress >= 100 ? 'Fully Funded' : 'Invest in This Project'}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Rest of your existing tabs and content remains the same */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Tabs colorScheme={isFullyFunded ? "purple" : "green"}>
                  <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Blockchain Info</Tab>
                    <Tab>Contributors ({contributions.length})</Tab>
                    {project.verification?.verifiedBy && <Tab>Verification</Tab>}
                  </TabList>

                  <TabPanels>
                    {/* Overview Tab - Keep your existing content */}
                    <TabPanel px={0} pt={6}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Card bg={overviewCardBg}>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <Heading size="sm" mb={2}>Project Details</Heading>
                              
                              <HStack>
                                <Icon as={FiMapPin} color="blue.500" boxSize={5} />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" color="gray.600">Location</Text>
                                  <Text fontWeight="semibold">{project.location}</Text>
                                </VStack>
                              </HStack>

                              <Divider />

                              <HStack>
                                <Icon as={FiCalendar} color="blue.500" boxSize={5} />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" color="gray.600">Timeline</Text>
                                  <Text fontWeight="semibold">{project.timeline}</Text>
                                </VStack>
                              </HStack>

                              <Divider />

                              <HStack>
                                <Icon as={FiUser} color="blue.500" boxSize={5} />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" color="gray.600">Category</Text>
                                  <Text fontWeight="semibold">{project.category.replace(/_/g, ' ')}</Text>
                                </VStack>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg={overviewCardBg}>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <Heading size="sm" mb={2}>Farmer Information</Heading>
                              
                              {typeof project.farmer === 'object' && project.farmer ? (
                                <VStack align="start" spacing={3}>
                                  <Box>
                                    <Text fontSize="sm" color="gray.600">Name</Text>
                                    <Text fontWeight="semibold">
                                      {project.farmer.firstName} {project.farmer.lastName}
                                    </Text>
                                  </Box>

                                  {project.farmer.email && (
                                    <Box>
                                      <Text fontSize="sm" color="gray.600">Email</Text>
                                      <Text fontWeight="semibold">{project.farmer.email}</Text>
                                    </Box>
                                  )}

                                  {project.farmerWalletAddress && (
                                    <Box>
                                      <Text fontSize="sm" color="gray.600">Wallet Address</Text>
                                      <Code fontSize="xs" colorScheme="green">
                                        {project.farmerWalletAddress.slice(0, 10)}...{project.farmerWalletAddress.slice(-8)}
                                      </Code>
                                    </Box>
                                  )}
                                </VStack>
                              ) : (
                                <Text color="gray.500">Farmer information not available</Text>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </TabPanel>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
  <CardBody>
    <Tabs colorScheme={isFullyFunded ? "purple" : "green"}>
      <TabList>
        <Tab>Overview</Tab>
        <Tab>Blockchain Info</Tab>
        <Tab>Contributors ({contributions.length})</Tab>
        {project.verification?.verifiedBy && <Tab>Verification</Tab>}
      </TabList>

      <TabPanels>
        {/* Overview Tab */}
        <TabPanel px={0} pt={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card bg={overviewCardBg}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="sm" mb={2}>Project Details</Heading>
                  
                  <HStack>
                    <Icon as={FiMapPin} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.600">Location</Text>
                      <Text fontWeight="semibold">{project.location}</Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <HStack>
                    <Icon as={FiCalendar} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.600">Timeline</Text>
                      <Text fontWeight="semibold">{project.timeline}</Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <HStack>
                    <Icon as={FiUser} color="blue.500" boxSize={5} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.600">Category</Text>
                      <Text fontWeight="semibold">{project.category.replace(/_/g, ' ')}</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={overviewCardBg}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="sm" mb={2}>Farmer Information</Heading>
                  
                  {typeof project.farmer === 'object' && project.farmer ? (
                    <VStack align="start" spacing={3}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Name</Text>
                        <Text fontWeight="semibold">
                          {project.farmer.firstName} {project.farmer.lastName}
                        </Text>
                      </Box>

                      {project.farmer.email && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">Email</Text>
                          <Text fontWeight="semibold">{project.farmer.email}</Text>
                        </Box>
                      )}

                      {project.farmerWalletAddress && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">Wallet Address</Text>
                          <Code fontSize="xs" colorScheme="green">
                            {project.farmerWalletAddress.slice(0, 10)}...{project.farmerWalletAddress.slice(-8)}
                          </Code>
                        </Box>
                      )}
                    </VStack>
                  ) : (
                    <Text color="gray.500">Farmer information not available</Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </TabPanel>

        {/* Blockchain Info Tab */}
        <TabPanel px={0} pt={6}>
          {blockchainData ? (
            <VStack spacing={4} align="stretch">
              <Card bg={blockchainCardBg}>
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Heading size="sm">Smart Contract</Heading>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Contract Address:</Text>
                      <Link
                        href={`https://polygonscan.com/address/${blockchainData.contractAddress}`}
                        isExternal
                        color="blue.600"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Code fontSize="xs">{blockchainData.contractAddress.slice(0, 10)}...</Code>
                        <Icon as={FiExternalLink} />
                      </Link>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Project ID:</Text>
                      <Badge colorScheme="purple">{blockchainData.blockchainProjectId}</Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={farmerCardBg}>
                <CardBody>
                  <VStack align="start" spacing={3}>
                  <Heading size="sm">Farmer&apos;s Wallet</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Funds will {isFullyFunded ? 'have been' : 'be'} automatically released to:
                    </Text>
                    <Link
                      href={`https://polygonscan.com/address/${blockchainData.farmerWalletAddress}`}
                      isExternal
                      color="green.600"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Code fontSize="xs" colorScheme="green">{blockchainData.farmerWalletAddress}</Code>
                      <Icon as={FiExternalLink} />
                    </Link>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={fundingCardBg}>
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Heading size="sm">Funding Status</Heading>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Current Funding:</Text>
                      <Text fontSize="sm" fontWeight="bold" color="purple.600">
                        {formatMatic(blockchainData.currentFunding)} MATIC
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Funding Goal:</Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {formatMatic(blockchainData.fundingGoal)} MATIC
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Progress:</Text>
                      <Badge colorScheme={isFullyFunded ? 'purple' : 'blue'}>
                        {progress.toFixed(1)}% Funded
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          ) : (
            <VStack spacing={4} py={8}>
              <Icon as={FiShield} boxSize={12} color="gray.400" />
              <Text color="gray.600">Project not yet deployed to blockchain</Text>
            </VStack>
          )}
        </TabPanel>

        {/* Contributors Tab */}
        <TabPanel px={0} pt={6}>
          {contributions.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {contributions.map((contribution: Contribution, index: number) => (
                <ContributionCard 
                  key={contribution._id || index} 
                  contribution={contribution} 
                  index={index} 
                />
              ))}
            </VStack>
          ) : (
            <VStack spacing={4} py={12}>
              <Icon as={FiUsers} boxSize={12} color="gray.400" />
              <Text color="gray.600">No contributions yet</Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Be the first to support this project!
              </Text>
            </VStack>
          )}
        </TabPanel>

        {/* Verification Tab */}
        {project.verification?.verifiedBy && (
          <TabPanel px={0} pt={6}>
            <Card bg="green.50" borderWidth="2px" borderColor="green.200">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Icon as={FiCheckCircle} color="green.600" boxSize={8} />
                    <Box>
                      <Heading size="md" color="green.800">Verified Project</Heading>
                      <Text fontSize="sm" color="gray.600">Government verified and approved</Text>
                    </Box>
                  </HStack>
                  <Divider />
                  <VStack align="stretch" spacing={3} w="full">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Verified By:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {typeof project.verification.verifiedBy === 'string' 
                          ? project.verification.verifiedBy 
                          : `${project.verification.verifiedBy?.firstName || ''} ${project.verification.verifiedBy?.lastName || ''}`.trim() || 'Official'}
                      </Text>
                    </HStack>
                    {project.verification.verifiedAt && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Date:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {new Date(project.verification.verifiedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  </CardBody>
</Card>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </VStack>
        </Container>

        {/* Contribution Modal */}
        {project && (
         <ContributionModal
         isOpen={isOpen}
         onClose={onClose}
         project={project as Project} 
         onSuccess={() => {
           if (params.id) {
             fetchProject(params.id as string); 
           }
           toast({
             title: 'Contribution Successful!',
             description: 'Your contribution has been recorded',
             status: 'success',
             duration: 3000,
           });
           onClose();
         }}
       />
        )}
      </Box>
    </RouteGuard>
  );
}