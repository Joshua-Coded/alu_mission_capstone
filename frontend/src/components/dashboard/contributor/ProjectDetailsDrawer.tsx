// ============================================
// FILE: components/contributor/ProjectDetailsDrawer.tsx
// Full project details with videos, docs, verification
// ============================================
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    HStack,
    Text,
    Badge,
    Divider,
    Box,
    Grid,
    GridItem,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
    Image,
    SimpleGrid,
    Progress,
    Icon,
    AspectRatio,
  } from '@chakra-ui/react';
  import { 
    FiCheckCircle, 
    FiMapPin, 
    FiCalendar,
    FiUsers,
    FiDownload,
    FiFileText
  } from 'react-icons/fi';
  import { ApprovedProject } from '@/types/contributor.types';
  
  interface ProjectDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    project: ApprovedProject | null;
    onContribute: () => void;
  }
  
  export default function ProjectDetailsDrawer({
    isOpen,
    onClose,
    project,
    onContribute,
  }: ProjectDetailsDrawerProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
  
    if (!project) return null;
  
    return (
      <Drawer isOpen={isOpen} onClose={onClose} size="xl" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" fontWeight="bold">{project.projectName}</Text>
              <HStack>
                <Badge colorScheme="green" fontSize="sm">
                  GOVERNMENT APPROVED
                </Badge>
                {project.verificationStatus === 'VERIFIED' && (
                  <HStack spacing={1}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text fontSize="sm" color="green.600" fontWeight="medium">
                      Verified
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </DrawerHeader>
  
          <DrawerBody>
            <Tabs colorScheme="green">
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Media</Tab>
                <Tab>Documents</Tab>
                <Tab>Impact</Tab>
              </TabList>
  
              <TabPanels>
                {/* Overview Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Funding Progress */}
                    <Box bg="green.50" p={4} borderRadius="md">
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">Funding Progress</Text>
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            {project.fundingProgress}%
                          </Text>
                        </HStack>
                        <Progress value={project.fundingProgress} colorScheme="green" size="lg" borderRadius="full" />
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.700">
                            ${project.currentFunding.toLocaleString()} raised
                          </Text>
                          <Text color="gray.700">
                            Goal: ${project.fundingGoal.toLocaleString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">{project.totalContributors} contributors</Text>
                          <Text color="gray.600">Min: ${project.minimumContribution}</Text>
                        </HStack>
                      </VStack>
                    </Box>
  
                    <Divider />
  
                    {/* Project Details */}
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <GridItem>
                        <Text fontSize="sm" color="gray.500">Farmer</Text>
                        <Text fontWeight="medium">{project.farmerName}</Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color="gray.500">Farmer ID</Text>
                        <Text fontWeight="medium" fontFamily="mono">{project.farmerId}</Text>
                      </GridItem>
                      <GridItem colSpan={2}>
                        <HStack fontSize="sm" color="gray.600">
                          <Icon as={FiMapPin} />
                          <Text>{project.location}, {project.district}</Text>
                        </HStack>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color="gray.500">Project Type</Text>
                        <Badge colorScheme="purple">{project.projectType}</Badge>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color="gray.500">Duration</Text>
                        <Text fontWeight="medium">{project.duration} months</Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color="gray.500">Expected Yield</Text>
                        <Text fontWeight="medium">{project.expectedYield}</Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color="gray.500">Sustainability Score</Text>
                        <Text fontWeight="bold" color="green.600">{project.sustainabilityScore}/100</Text>
                      </GridItem>
                    </Grid>
  
                    <Divider />
  
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>Project Description</Text>
                      <Text fontSize="sm" color="gray.700">{project.description}</Text>
                    </Box>
  
                    <Divider />
  
                    {/* Government Verification */}
                    <Box bg="blue.50" p={4} borderRadius="md">
                      <VStack align="stretch" spacing={2}>
                        <HStack>
                          <Icon as={FiCheckCircle} color="blue.600" />
                          <Text fontWeight="semibold" color="blue.800">
                            Government Verification
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.700">
                          Approved by: {project.approvedBy}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Approved on: {new Date(project.approvedAt).toLocaleDateString()}
                        </Text>
                        {project.governmentComments && (
                          <Box>
                            <Text fontSize="xs" fontWeight="semibold" color="gray.600">Comments:</Text>
                            <Text fontSize="sm" color="gray.700">{project.governmentComments}</Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
  
                    <Button colorScheme="green" size="lg" onClick={onContribute}>
                      Contribute to This Project
                    </Button>
                  </VStack>
                </TabPanel>
  
                {/* Media Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Videos */}
                    {project.videos.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={3}>Project Videos</Text>
                        <VStack spacing={4}>
                          {project.videos.map((videoUrl, index) => (
                            <AspectRatio key={index} ratio={16 / 9} w="full">
                              <iframe
                                src={videoUrl}
                                title={`Project video ${index + 1}`}
                                allowFullScreen
                              />
                            </AspectRatio>
                          ))}
                        </VStack>
                      </Box>
                    )}
  
                    {/* Images */}
                    {project.images.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={3}>Project Images</Text>
                        <SimpleGrid columns={2} spacing={4}>
                          {project.images.map((imageUrl, index) => (
                            <Image
                              key={index}
                              src={imageUrl}
                              alt={`Project image ${index + 1}`}
                              borderRadius="md"
                              objectFit="cover"
                              h="200px"
                              w="full"
                            />
                          ))}
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
  
                {/* Documents Tab */}
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" fontWeight="semibold">Project Documents</Text>
                    {project.documents.map((doc) => (
                      <Box key={doc.id} p={4} borderWidth="1px" borderRadius="md" bg={cardBg}>
                        <HStack justify="space-between">
                          <HStack>
                            <Icon as={FiFileText} color="blue.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">{doc.name}</Text>
                              <HStack spacing={2} fontSize="xs" color="gray.500">
                                <Text>{doc.type.replace(/_/g, ' ')}</Text>
                                <Text>•</Text>
                                <Text>{doc.size}</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <HStack>
                            {doc.verified && (
                              <Badge colorScheme="green">Verified</Badge>
                            )}
                            <Button size="sm" leftIcon={<FiDownload />} variant="outline">
                              Download
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
  
                {/* Impact Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={3}>Expected Impact</Text>
                      <Text fontSize="sm" color="gray.700">{project.expectedImpact}</Text>
                    </Box>
  
                    <Divider />
  
                    <SimpleGrid columns={2} spacing={4}>
                      <Box bg="green.50" p={4} borderRadius="md">
                        <Icon as={FiUsers} color="green.600" boxSize={6} mb={2} />
                        <Text fontSize="2xl" fontWeight="bold" color="green.700">
                          {project.beneficiaries}
                        </Text>
                        <Text fontSize="sm" color="gray.600">Beneficiaries</Text>
                      </Box>
                      <Box bg="blue.50" p={4} borderRadius="md">
                        <Icon as={FiUsers} color="blue.600" boxSize={6} mb={2} />
                        <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                          {project.jobsCreated}
                        </Text>
                        <Text fontSize="sm" color="gray.600">Jobs Created</Text>
                      </Box>
                    </SimpleGrid>
  
                    <Box bg="purple.50" p={4} borderRadius="md">
                      <Text fontSize="sm" fontWeight="semibold" mb={2} color="purple.800">
                        Sustainability Score
                      </Text>
                      <Progress value={project.sustainabilityScore} colorScheme="purple" size="lg" borderRadius="full" />
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        {project.sustainabilityScore}/100 - Environmental impact assessment
                      </Text>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  