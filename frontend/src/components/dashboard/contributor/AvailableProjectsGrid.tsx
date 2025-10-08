// ============================================
// FILE: components/contributor/AvailableProjectsGrid.tsx
// Shows government-approved projects available for funding
// ============================================
import {
    Card,
    CardHeader,
    CardBody,
    Heading,
    Flex,
    Button,
    SimpleGrid,
    Badge,
    HStack,
    useColorModeValue,
    Input,
    Select,
    InputGroup,
    InputLeftElement,
    Text,
    Image,
    VStack,
    Progress,
    Box,
    Icon,
  } from '@chakra-ui/react';
  import { 
    FiSearch,
    FiFilter,
    FiMapPin,
    FiClock,
    FiUsers,
    FiCheckCircle,
  } from 'react-icons/fi';
  import { useState } from 'react';
  import { ApprovedProject, ProjectStatus } from '@/types/contributor.types';
  
  interface AvailableProjectsGridProps {
    projects: ApprovedProject[];
    onViewProject: (projectId: string) => void;
    onContribute: (projectId: string) => void;
  }
  
  export default function AvailableProjectsGrid({
    projects,
    onViewProject,
    onContribute,
  }: AvailableProjectsGridProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const [searchTerm, setSearchTerm] = useState('');
    const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  
    const getStatusColor = (status: ProjectStatus) => {
      const colors: Record<string, string> = {
        APPROVED_FOR_FUNDING: 'blue',
        FUNDING_IN_PROGRESS: 'yellow',
        FULLY_FUNDED: 'purple',
        IN_PROGRESS: 'orange',
        COMPLETED: 'green',
      };
      return colors[status] || 'gray';
    };
  
    const filteredProjects = projects.filter(project => {
      const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistrict = districtFilter === 'ALL' || project.district === districtFilter;
      return matchesSearch && matchesDistrict;
    });
  
    const uniqueDistricts = Array.from(new Set(projects.map(p => p.district)));
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="md" color="green.600">
                Available Projects for Funding
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Government-approved agricultural projects
              </Text>
            </Box>
            <HStack spacing={3}>
              <InputGroup size="sm" w="250px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                size="sm"
                w="160px"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                icon={<FiFilter />}
              >
                <option value="ALL">All Districts</option>
                {uniqueDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </Select>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((project) => (
              <Card key={project.id} bg="white" border="1px" borderColor={borderColor} overflow="hidden">
                {/* Project Image */}
                <Image
                  src={project.images[0] || '/placeholder-project.jpg'}
                  alt={project.projectName}
                  h="200px"
                  w="full"
                  objectFit="cover"
                />
                
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {/* Status and Verification */}
                    <HStack justify="space-between">
                      <Badge colorScheme={getStatusColor(project.status)} fontSize="xs">
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                      {project.verificationStatus === 'VERIFIED' && (
                        <HStack spacing={1}>
                          <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
                          <Text fontSize="xs" color="green.600" fontWeight="medium">
                            Verified
                          </Text>
                        </HStack>
                      )}
                    </HStack>
  
                    {/* Project Title */}
                    <Heading size="sm" noOfLines={2}>
                      {project.projectName}
                    </Heading>
  
                    {/* Farmer Info */}
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">
                        by <Text as="span" fontWeight="semibold">{project.farmerName}</Text>
                      </Text>
                    </HStack>
  
                    {/* Location */}
                    <HStack fontSize="sm" color="gray.600">
                      <Icon as={FiMapPin} boxSize={4} />
                      <Text>{project.location}, {project.district}</Text>
                    </HStack>
  
                    {/* Impact Metrics */}
                    <VStack spacing={2} align="stretch" bg="green.50" p={3} borderRadius="md">
                      <HStack justify="space-between">
                        <HStack fontSize="sm">
                          <Icon as={FiUsers} color="green.600" />
                          <Text color="gray.700">{project.beneficiaries} beneficiaries</Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="medium" color="green.700">
                          {project.jobsCreated} jobs
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {project.expectedImpact}
                      </Text>
                    </VStack>
  
                    {/* Funding Progress */}
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          ${project.currentFunding.toLocaleString()} raised
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          of ${project.fundingGoal.toLocaleString()}
                        </Text>
                      </Flex>
                      <Progress
                        value={project.fundingProgress}
                        colorScheme="green"
                        size="sm"
                        borderRadius="full"
                      />
                      <Flex justify="space-between" mt={1}>
                        <Text fontSize="xs" color="gray.500">
                          {project.totalContributors} contributors
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {project.fundingProgress}% funded
                        </Text>
                      </Flex>
                    </Box>
  
                    {/* Minimum Contribution */}
                    <Text fontSize="xs" color="gray.600">
                      Min. contribution: ${project.minimumContribution}
                    </Text>
  
                    {/* Action Buttons */}
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                        flex="1"
                        onClick={() => onViewProject(project.id)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        flex="1"
                        onClick={() => onContribute(project.id)}
                        isDisabled={project.status === ProjectStatus.FULLY_FUNDED}
                      >
                        Contribute
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  }