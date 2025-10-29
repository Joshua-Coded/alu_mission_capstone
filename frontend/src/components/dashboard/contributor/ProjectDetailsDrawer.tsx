import ProjectSuccessView from "../farmer/ProjectSuccessView";
import contributionApi from "../../../lib/contributionApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Project, projectApi } from "../../../lib/projectApi";

import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Grid,
  GridItem,
  Progress,
  Icon,
  Image,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  IconButton,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { 
  FiCheckCircle, 
  FiMapPin,
  FiDownload,
  FiFileText,
  FiArrowLeft,
  FiHeart,
  FiShield,
  FiUsers,
} from 'react-icons/fi';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [loadingBlockchain, setLoadingBlockchain] = useState(false);
  const [realContributorCount, setRealContributorCount] = useState<number>(0); // ✅ ADDED: Real contributor count
  const [loadingContributions, setLoadingContributions] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjectById(projectId!);
      setProject(data);
      
      // ✅ FIXED: Fetch real contribution data
      fetchProjectContributions(data._id);
      
      // Fetch blockchain data if project is on-chain
      if (data.blockchainProjectId !== null && data.blockchainProjectId !== undefined) {
        fetchBlockchainData(data._id);
      }
      
      // Check if project is in favorites
      try {
        const favorites = await projectApi.getFavorites();
        setIsFavorite(favorites.some((f: Project) => f._id === projectId));
      } catch (err) {
        console.log('Favorites not available');
      }
    } catch (err: any) {
      toast({
        title: 'Error Loading Project',
        description: err.message || 'Failed to load project details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Fetch real contribution data
  const fetchProjectContributions = async (projectId: string) => {
    try {
      setLoadingContributions(true);
      const contributionsResult = await contributionApi.getProjectContributions(projectId);
      
      if (contributionsResult.success && contributionsResult.data) {
        setRealContributorCount(contributionsResult.data.contributorCount || 0);
      } else {
        // Fallback to project's contributor count
        setRealContributorCount(project?.contributorsCount || 0);
      }
    } catch (error: any) {
      console.error('Failed to fetch project contributions:', error);
      // Fallback to project's contributor count
      setRealContributorCount(project?.contributorsCount || 0);
    } finally {
      setLoadingContributions(false);
    }
  };

  const fetchBlockchainData = async (projectId: string) => {
    try {
      setLoadingBlockchain(true);
      const response = await projectApi.getBlockchainStatus(projectId);
      
      if (response.blockchainEnabled) {
        setBlockchainData({
          currentFunding: response.totalFunding?.toString() || '0',
          fundingGoal: response.fundingGoal?.toString() || '0',
          isFullyFunded: response.isFunded || false,
          
        });
      }
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setLoadingBlockchain(false);
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await projectApi.removeFromFavorites(projectId!);
        setIsFavorite(false);
        toast({ title: 'Removed from favorites', status: 'info', duration: 2000 });
      } else {
        await projectApi.addToFavorites(projectId!);
        setIsFavorite(true);
        toast({ title: 'Added to favorites', status: 'success', duration: 2000 });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update favorites', status: 'error', duration: 3000 });
    }
  };

  const handleContribute = () => {
    navigate(`/projects/${projectId}/contribute`);
  };

  const getFarmerName = () => {
    if (!project) return 'Farmer';
    if (typeof project.farmer === 'string') return project.farmer;
    if (project.farmer?.firstName && project.farmer?.lastName) {
      return `${project.farmer.firstName} ${project.farmer.lastName}`;
    }
    return 'Farmer';
  };

  const defaultImage = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.600">Loading project details...</Text>
        </VStack>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="red.600">Project not found</Text>
          <Button onClick={() => navigate('/projects/active')}>Back to Projects</Button>
        </VStack>
      </Box>
    );
  }

  // ✅ UPDATED: Calculate if project is fully funded with real data
  const currentFunding = blockchainData?.currentFunding 
    ? parseFloat(blockchainData.currentFunding) 
    : project.currentFunding;
    
  const fundingGoal = blockchainData?.fundingGoal 
    ? parseFloat(blockchainData.fundingGoal) 
    : project.fundingGoal;

  const isFullyFunded = blockchainData?.isFullyFunded || 
    (currentFunding >= fundingGoal && fundingGoal > 0);

  const progress = fundingGoal > 0 ? (currentFunding / fundingGoal) * 100 : 0;
  const hasImages = project.images && project.images.length > 0;
  const currentImage = hasImages ? project.images[activeImage] : defaultImage;

  // ✅ UPDATED: Use real contributor count from API
  const contributorCount = blockchainData?.contributorCount || realContributorCount || project.contributorsCount || 0;

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box bg={cardBg} borderBottom="1px" borderColor={borderColor} py={4} position="sticky" top={0} zIndex={10}>
        <Container maxW="7xl">
          <HStack justify="space-between">
            <Button leftIcon={<FiArrowLeft />} variant="ghost" onClick={() => navigate(-1)}>
              Back
            </Button>
            <HStack spacing={2}>
              <IconButton
                aria-label="Add to favorites"
                icon={<FiHeart />}
                variant={isFavorite ? 'solid' : 'outline'}
                colorScheme={isFavorite ? 'red' : 'gray'}
                onClick={handleFavorite}
              />
              {!isFullyFunded && (
                <Button colorScheme="green" onClick={handleContribute}>
                  Contribute Now
                </Button>
              )}
              {isFullyFunded && (
                <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full">
                  🎉 FULLY FUNDED
                </Badge>
              )}
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="7xl" py={8}>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Left Column */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Images */}
              <Box bg={cardBg} borderRadius="lg" overflow="hidden" shadow="sm">
                <Box position="relative" h="400px" bg="gray.200">
                  {hasImages ? (
                    <>
                      <Image 
                        src={currentImage} 
                        alt={project.title} 
                        w="full" 
                        h="full" 
                        objectFit="cover"
                        fallbackSrc={defaultImage}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = defaultImage;
                        }}
                      />
                      {project.images.length > 1 && (
                        <>
                          <IconButton
                            aria-label="Previous"
                            icon={<FiArrowLeft />}
                            position="absolute"
                            left={4}
                            top="50%"
                            transform="translateY(-50%)"
                            onClick={() => setActiveImage(prev => prev === 0 ? project.images.length - 1 : prev - 1)}
                            colorScheme="whiteAlpha"
                            rounded="full"
                          />
                          <IconButton
                            aria-label="Next"
                            icon={<FiArrowLeft style={{ transform: 'rotate(180deg)' }} />}
                            position="absolute"
                            right={4}
                            top="50%"
                            transform="translateY(-50%)"
                            onClick={() => setActiveImage(prev => prev === project.images.length - 1 ? 0 : prev + 1)}
                            colorScheme="whiteAlpha"
                            rounded="full"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="full">
                      <Image 
                        src={defaultImage} 
                        alt="Default project" 
                        w="full" 
                        h="full" 
                        objectFit="cover" 
                      />
                    </Box>
                  )}
                </Box>
                {hasImages && project.images.length > 1 && (
                  <HStack p={4} spacing={2} overflowX="auto">
                    {project.images.map((img, idx) => (
                      <Box
                        key={idx}
                        w="80px"
                        h="80px"
                        borderRadius="md"
                        overflow="hidden"
                        borderWidth="2px"
                        borderColor={activeImage === idx ? 'green.500' : 'gray.200'}
                        cursor="pointer"
                        onClick={() => setActiveImage(idx)}
                        flexShrink={0}
                      >
                        <Image 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`} 
                          w="full" 
                          h="full" 
                          objectFit="cover"
                          fallbackSrc={defaultImage}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultImage;
                          }}
                        />
                      </Box>
                    ))}
                  </HStack>
                )}
              </Box>

              {/* Tabs */}
              <Box bg={cardBg} borderRadius="lg" p={6} shadow="sm">
                <Tabs colorScheme={isFullyFunded ? "purple" : "green"}>
                  <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Documents</Tab>
                    <Tab>Verification</Tab>
                    {isFullyFunded && <Tab>Success Story</Tab>}
                  </TabList>

                  <TabPanels>
                    {/* Overview */}
                    <TabPanel px={0}>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <HStack spacing={3} mb={4} flexWrap="wrap">
                            <Badge colorScheme="green">{project.category?.replace(/_/g, ' ')}</Badge>
                            {isFullyFunded && (
                              <Badge colorScheme="purple" fontSize="sm">
                                🎉 FUNDED
                              </Badge>
                            )}
                            <HStack fontSize="sm" color="gray.600">
                              <Icon as={FiMapPin} />
                              <Text>{project.location}</Text>
                            </HStack>
                          </HStack>
                          <Heading size="lg" mb={2}>{project.title}</Heading>
                          <Text color="gray.600">by {getFarmerName()}</Text>
                        </Box>

                        <Divider />

                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" mb={2}>Description</Text>
                          <Text color="gray.700" whiteSpace="pre-wrap">{project.description}</Text>
                        </Box>

                        <Divider />

                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <GridItem>
                            <Text fontSize="sm" color="gray.500">Timeline</Text>
                            <Text fontWeight="medium">{project.timeline}</Text>
                          </GridItem>
                          <GridItem>
                            <Text fontSize="sm" color="gray.500">Project ID</Text>
                            <Text fontFamily="mono" fontSize="sm">{project.projectId}</Text>
                          </GridItem>
                          <GridItem>
                            <Text fontSize="sm" color="gray.500">Status</Text>
                            <Badge colorScheme={isFullyFunded ? 'purple' : project.status === 'active' ? 'green' : 'gray'}>
                              {isFullyFunded ? 'FUNDED' : project.status}
                            </Badge>
                          </GridItem>
                          <GridItem>
                            <Text fontSize="sm" color="gray.500">Contributors</Text>
                            <HStack>
                              <Text fontWeight="medium">{contributorCount} people</Text>
                              {loadingContributions && <Spinner size="xs" />}
                            </HStack>
                          </GridItem>
                          {project.department && (
                            <GridItem>
                              <Text fontSize="sm" color="gray.500">Department</Text>
                              <Text fontWeight="medium">{project.department}</Text>
                            </GridItem>
                          )}
                        </Grid>

                        {project.verification?.verifiedBy && (
                          <>
                            <Divider />
                            <Box bg="green.50" p={4} borderRadius="md">
                              <HStack mb={2}>
                                <Icon as={FiCheckCircle} color="green.600" />
                                <Text fontWeight="semibold" color="green.800">Government Verified</Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.700">
                                Verified by: {typeof project.verification.verifiedBy === 'string' 
                                  ? project.verification.verifiedBy 
                                  : `${project.verification.verifiedBy?.firstName || ''} ${project.verification.verifiedBy?.lastName || ''}`.trim() || 'Official'}
                              </Text>
                              {project.verification.verifiedAt && (
                                <Text fontSize="xs" color="gray.600">
                                  {new Date(project.verification.verifiedAt).toLocaleDateString()}
                                </Text>
                              )}
                            </Box>
                          </>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Documents */}
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        {project.documents && project.documents.length > 0 ? (
                          project.documents.map((doc, idx) => (
                            <Box key={idx} p={4} borderWidth="1px" borderRadius="md">
                              <HStack justify="space-between">
                                <HStack>
                                  <Icon as={FiFileText} color="blue.500" />
                                  <Text fontWeight="medium" fontSize="sm">{doc.name}</Text>
                                </HStack>
                                <Button size="sm" leftIcon={<FiDownload />} variant="outline" as="a" href={doc.url} target="_blank">
                                  Download
                                </Button>
                              </HStack>
                            </Box>
                          ))
                        ) : (
                          <Text color="gray.500" textAlign="center" py={8}>No documents available</Text>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Verification */}
                    <TabPanel px={0}>
                      <VStack spacing={6} align="stretch">
                        {project.verification?.verifiedBy ? (
                          <Box bg="green.50" p={6} borderRadius="md">
                            <HStack mb={4}>
                              <Icon as={FiCheckCircle} color="green.600" boxSize={8} />
                              <Box>
                                <Text fontWeight="bold" fontSize="lg" color="green.800">Verified Project</Text>
                                <Text fontSize="sm" color="gray.600">Government verified and approved</Text>
                              </Box>
                            </HStack>
                            <Divider my={4} />
                            <VStack align="stretch" spacing={3}>
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
                                    {new Date(project.verification.verifiedAt).toLocaleDateString()}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                          </Box>
                        ) : (
                          <Box bg="gray.50" p={6} borderRadius="md" textAlign="center">
                            <Icon as={FiShield} color="gray.400" boxSize={12} mb={2} />
                            <Text color="gray.600">Verification pending</Text>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* ✅ NEW: Success Story Tab (only shows if funded) */}
                    {isFullyFunded && (
                      <TabPanel px={0}>
                        <ProjectSuccessView
                          project={project}
                          blockchainData={blockchainData}
                          
                        />
                      </TabPanel>
                    )}
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </GridItem>

          {/* Right Column - Funding */}
          <GridItem>
            <Box position="sticky" top="100px">
              <VStack spacing={6} align="stretch">
                {/* ✅ Show Success View or Regular Funding */}
                {isFullyFunded ? (
                  <Box bg={cardBg} borderRadius="lg" p={6} shadow="lg" border="2px" borderColor="purple.300">
                    <ProjectSuccessView
                      project={project}
                      blockchainData={blockchainData}
                  
                    />
                  </Box>
                ) : (
                  <Box bg={cardBg} borderRadius="lg" p={6} shadow="sm">
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack spacing={2} mb={1}>
                          <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                            {currentFunding.toFixed(4)}
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                            MATIC
                          </Text>
                          <Text as="span" color="purple.400" fontSize="2xl">⬡</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.600">
                            raised of
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            {fundingGoal.toFixed(4)} MATIC
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            goal
                          </Text>
                        </HStack>
                      </Box>

                      <Progress value={progress} colorScheme="green" size="lg" borderRadius="full" />

                      <HStack justify="space-between" fontSize="sm">
                        <Text fontWeight="semibold">{progress.toFixed(1)}%</Text>
                        <HStack>
                          <Icon as={FiUsers} color="gray.500" />
                          <Text color="gray.600">
                            {contributorCount} {contributorCount === 1 ? 'contributor' : 'contributors'}
                          </Text>
                          {loadingContributions && <Spinner size="xs" />}
                        </HStack>
                      </HStack>

                      <Divider />

                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Timeline</Text>
                        <Text fontSize="sm" fontWeight="medium">{project.timeline}</Text>
                      </HStack>

                      <Button colorScheme="green" size="lg" w="full" onClick={handleContribute}>
                        Contribute Now
                      </Button>

                      <Button variant="outline" size="lg" w="full" onClick={handleFavorite}>
                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      </Button>
                    </VStack>
                  </Box>
                )}

                <Box bg={cardBg} borderRadius="lg" p={4} shadow="sm">
                  <VStack spacing={2}>
                    <HStack>
                      <Icon as={FiCheckCircle} color={isFullyFunded ? "purple.500" : "green.500"} />
                      <Badge colorScheme={isFullyFunded ? "purple" : "green"} px={3} py={1}>
                        {isFullyFunded ? 'FUNDED' : project.status.toUpperCase()}
                      </Badge>
                    </HStack>
                    {project.verification?.verifiedBy && (
                      <HStack>
                        <Icon as={FiShield} color="blue.500" />
                        <Text fontSize="xs" color="gray.600">Verified Project</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}