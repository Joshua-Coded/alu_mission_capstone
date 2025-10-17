import CreateProjectModal from "./CreateProjectModal";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiChevronDown, FiFilter, FiPlus, FiRefreshCw } from "react-icons/fi";
import { Project as ApiProject, ProjectStatus, projectApi } from "../../../lib/projectApi";
import { EditProjectModal } from "./EditProjectModal";
import { ShareProjectModal } from "./ShareProjectModal";

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  SimpleGrid,
  Flex,
  useColorModeValue,
  useDisclosure,
  HStack,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Icon,
  VStack,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

const FarmerProjectsSection: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const filterParam = searchParams.get('filter');
  const actionParam = searchParams.get('action');
  
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal controls
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();

  // Fetch projects from backend
  const loadProjects = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('========================================');
      console.log('🔄 LOADING PROJECTS FROM API...');
      console.log('========================================');
      
      // CRITICAL: Load ALL projects without status filter
      const apiProjects = await projectApi.getMyProjects();
      
      console.log('📊 RAW PROJECTS FROM API:', apiProjects.length);
      console.log('========================================');
      
      // Debug: Log each project's status
      apiProjects.forEach((p, idx) => {
        console.log(`Project ${idx + 1}: "${p.title}"`);
        console.log(`  - Status: ${p.status}`);
        console.log(`  - Blockchain Status: ${p.blockchainStatus || 'not_created'}`);
        console.log(`  - Blockchain ID: ${p.blockchainProjectId || 'none'}`);
        console.log(`  - Funding: $${p.currentFunding} / $${p.fundingGoal}`);
        console.log('---');
      });
      
      setProjects(apiProjects);
      
      // Show blockchain status summary
      const blockchainStats = {
        created: apiProjects.filter(p => p.blockchainStatus === 'created').length,
        failed: apiProjects.filter(p => p.blockchainStatus === 'failed').length,
        pending: apiProjects.filter(p => p.blockchainStatus === 'pending').length,
        notCreated: apiProjects.filter(p => !p.blockchainStatus || p.blockchainStatus === 'not_created').length,
      };
      
      const statusCounts = {
        submitted: apiProjects.filter(p => p.status === 'submitted').length,
        underReview: apiProjects.filter(p => p.status === 'under_review').length,
        active: apiProjects.filter(p => p.status === 'active').length,
        funded: apiProjects.filter(p => p.status === 'funded').length,
        rejected: apiProjects.filter(p => p.status === 'rejected').length,
      };
      
      console.log('✅ Total Projects:', apiProjects.length);
      console.log('📋 Status Breakdown:', statusCounts);
      console.log('⛓️ Blockchain Status:', blockchainStats);
      console.log('========================================');
      
      if (showRefreshToast) {
        toast({
          title: 'Projects Refreshed',
          description: `Loaded ${apiProjects.length} project${apiProjects.length !== 1 ? 's' : ''}`,
          status: 'success',
          duration: 2000,
        });
      }
      
    } catch (error: any) {
      console.error('❌ ERROR LOADING PROJECTS:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast({
        title: 'Error loading projects',
        description: error.message || 'Failed to load projects',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    loadProjects();
    
    // Auto-refresh every 30 seconds to catch status changes
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing projects...');
      loadProjects(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []); // Only run on mount

  // Filter projects based on URL parameter
  const filteredProjects = useMemo(() => {
    console.log('🔍 Filtering projects with param:', filterParam);
    console.log('🔍 Total projects before filter:', projects.length);
    
    if (!filterParam) {
      console.log('✅ No filter - returning all', projects.length, 'projects');
      return projects;
    }
    
    let filtered: ApiProject[] = [];
    
    switch (filterParam) {
      case 'active':
        filtered = projects.filter(p => p.status === ProjectStatus.ACTIVE);
        console.log('✅ Active filter:', filtered.length, 'projects');
        break;
      case 'completed':
        filtered = projects.filter(p => 
          p.status === ProjectStatus.FUNDED || 
          p.status === 'closed' as ProjectStatus
        );
        console.log('✅ Completed filter:', filtered.length, 'projects');
        break;
      case 'funding':
        filtered = projects.filter(p => p.status === ProjectStatus.ACTIVE);
        console.log('✅ Funding filter:', filtered.length, 'projects');
        break;
      case 'pending':
        filtered = projects.filter(p => 
          p.status === ProjectStatus.SUBMITTED || 
          p.status === ProjectStatus.UNDER_REVIEW
        );
        console.log('✅ Pending filter:', filtered.length, 'projects');
        break;
      default:
        filtered = projects;
        console.log('✅ Default - returning all', projects.length, 'projects');
    }
    
    return filtered;
  }, [projects, filterParam]);

  // Get counts for each status
  const projectCounts = useMemo(() => {
    const counts = {
      all: projects.length,
      active: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
      completed: projects.filter(p => 
        p.status === ProjectStatus.FUNDED || 
        p.status === 'closed' as ProjectStatus
      ).length,
      funding: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
      pending: projects.filter(p => 
        p.status === ProjectStatus.SUBMITTED || 
        p.status === ProjectStatus.UNDER_REVIEW
      ).length,
    };
    
    console.log('📊 Project Counts:', counts);
    return counts;
  }, [projects]);

  // Get blockchain status counts
  const blockchainCounts = useMemo(() => {
    return {
      onBlockchain: projects.filter(p => p.blockchainStatus === 'created').length,
      failed: projects.filter(p => p.blockchainStatus === 'failed').length,
      creating: projects.filter(p => p.blockchainStatus === 'pending').length,
      notOnBlockchain: projects.filter(p => !p.blockchainStatus || p.blockchainStatus === 'not_created').length,
    };
  }, [projects]);

  // Auto-open create modal if action=create in URL
  React.useEffect(() => {
    if (actionParam === 'create') {
      onCreateOpen();
    }
  }, [actionParam, onCreateOpen]);

  const handleViewDetails = (project: ApiProject) => {
    setSelectedProject(project);
    onDetailsOpen();
  };

  const handleEditProject = (project: ApiProject) => {
    setSelectedProject(project);
    onEditOpen();
  };

  const handleShareProject = (project: ApiProject) => {
    setSelectedProject(project);
    onShareOpen();
  };

  const handleSaveProject = (updatedProject: ApiProject) => {
    setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
  };

  const handleProjectCreated = () => {
    loadProjects();
    
    toast({
      title: 'Project Created Successfully! 🎉',
      description: 'Your project has been submitted and is being added to the blockchain',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleRefresh = () => {
    loadProjects(true);
  };

  const getFilterLabel = () => {
    if (!filterParam) return 'All Projects';
    
    switch (filterParam) {
      case 'active':
        return 'Active Projects';
      case 'completed':
        return 'Completed Projects';
      case 'funding':
        return 'Seeking Funding';
      case 'pending':
        return 'Pending Verification';
      default:
        return 'All Projects';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed':
      case 'funded': return 'purple';
      case 'funding': return 'blue';
      case 'pending':
      case 'submitted':
      case 'under_review': return 'yellow';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  // Blockchain status summary component
  const BlockchainStatusSummary = () => {
    if (projects.length === 0) return null;
    
    return (
      <HStack spacing={4} mt={2} fontSize="sm" flexWrap="wrap">
        <Text color="gray.600" fontWeight="medium">Blockchain Status:</Text>
        {blockchainCounts.onBlockchain > 0 && (
          <Badge colorScheme="green" variant="subtle" display="flex" alignItems="center" gap={1}>
            ⛓️ {blockchainCounts.onBlockchain} On-chain
          </Badge>
        )}
        {blockchainCounts.creating > 0 && (
          <Badge colorScheme="yellow" variant="subtle">
            ⏳ {blockchainCounts.creating} Creating
          </Badge>
        )}
        {blockchainCounts.failed > 0 && (
          <Badge colorScheme="red" variant="subtle">
            ❌ {blockchainCounts.failed} Failed
          </Badge>
        )}
        {blockchainCounts.notOnBlockchain > 0 && (
          <Badge colorScheme="gray" variant="subtle">
            📝 {blockchainCounts.notOnBlockchain} Local only
          </Badge>
        )}
      </HStack>
    );
  };

  // Show warning if there are blockchain failures
  const BlockchainFailureAlert = () => {
    if (blockchainCounts.failed === 0) return null;
    
    return (
      <Alert status="warning" borderRadius="md" mb={4}>
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Blockchain Creation Issues</AlertTitle>
          <AlertDescription fontSize="xs">
            {blockchainCounts.failed} project{blockchainCounts.failed !== 1 ? 's' : ''} failed to create on blockchain. 
            They can still receive funding through the platform.
          </AlertDescription>
        </Box>
      </Alert>
    );
  };

  if (loading) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <Flex justify="center" align="center" minH="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="green.500" thickness="4px" />
              <Text color="gray.600">Loading your projects...</Text>
            </VStack>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card bg={cardBg} border="1px" borderColor={borderColor} h="fit-content">
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1} flex={1}>
              <HStack spacing={3}>
                <Heading size="md" color="green.600">
                  {getFilterLabel()}
                </Heading>
                <Badge colorScheme={getStatusColor(filterParam || 'all')} px={3} py={1} fontSize="sm">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
                </Badge>
              </HStack>
              
              {/* Blockchain Status Summary */}
              <BlockchainStatusSummary />
              
              {filterParam && (
                <Text fontSize="sm" color="gray.600">
                  Showing {filterParam} projects only
                </Text>
              )}
            </VStack>
            
            <HStack spacing={3}>
              {/* Refresh Button */}
              <Tooltip label="Refresh projects" hasArrow>
                <IconButton
                  icon={<FiRefreshCw />}
                  onClick={handleRefresh}
                  isLoading={refreshing}
                  variant="outline"
                  size="sm"
                  aria-label="Refresh projects"
                />
              </Tooltip>

              {/* Filter Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FiFilter />}
                  rightIcon={<FiChevronDown />}
                  variant="outline"
                  size="sm"
                >
                  Filter
                </MenuButton>
                <MenuList>
                  <MenuItem 
                    as="a" 
                    href="/dashboard/farmer?tab=projects"
                    fontWeight={!filterParam ? 'bold' : 'normal'}
                  >
                    All Projects ({projectCounts.all})
                  </MenuItem>
                  <MenuItem 
                    as="a" 
                    href="/dashboard/farmer?tab=projects&filter=active"
                    fontWeight={filterParam === 'active' ? 'bold' : 'normal'}
                  >
                    <HStack w="full" justify="space-between">
                      <Text>Active Projects</Text>
                      <Badge colorScheme="green">{projectCounts.active}</Badge>
                    </HStack>
                  </MenuItem>
                  <MenuItem 
                    as="a" 
                    href="/dashboard/farmer?tab=projects&filter=completed"
                    fontWeight={filterParam === 'completed' ? 'bold' : 'normal'}
                  >
                    <HStack w="full" justify="space-between">
                      <Text>Completed Projects</Text>
                      <Badge colorScheme="purple">{projectCounts.completed}</Badge>
                    </HStack>
                  </MenuItem>
                  <MenuItem 
                    as="a" 
                    href="/dashboard/farmer?tab=projects&filter=funding"
                    fontWeight={filterParam === 'funding' ? 'bold' : 'normal'}
                  >
                    <HStack w="full" justify="space-between">
                      <Text>Seeking Funding</Text>
                      <Badge colorScheme="blue">{projectCounts.funding}</Badge>
                    </HStack>
                  </MenuItem>
                  <MenuItem 
                    as="a" 
                    href="/dashboard/farmer?tab=projects&filter=pending"
                    fontWeight={filterParam === 'pending' ? 'bold' : 'normal'}
                  >
                    <HStack w="full" justify="space-between">
                      <Text>Pending Verification</Text>
                      <Badge colorScheme="yellow">{projectCounts.pending}</Badge>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Create Button */}
              <Button 
                leftIcon={<FiPlus />} 
                colorScheme="green" 
                size="sm"
                bgGradient="linear(to-r, green.400, green.600)"
                _hover={{
                  bgGradient: "linear(to-r, green.500, green.700)",
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
                onClick={onCreateOpen}
              >
                New Project
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        
        <CardBody>
          {/* Blockchain Failure Warning */}
          <BlockchainFailureAlert />
          
          {filteredProjects.length === 0 ? (
            <Box 
              textAlign="center" 
              py={12} 
              px={6}
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="xl"
            >
              <Icon as={FiFilter} boxSize={12} color="gray.400" mb={4} />
              <Text fontSize="lg" fontWeight="medium" color="gray.600" mb={2}>
                No {filterParam ? filterParam : ''} projects found
              </Text>
              <Text fontSize="sm" color="gray.500" mb={4}>
                {projects.length > 0 ? (
                  <>
                    You have {projects.length} project{projects.length !== 1 ? 's' : ''} total, 
                    but none match the "{filterParam}" filter.
                  </>
                ) : (
                  'Start by creating your first project and get government approval to receive funding.'
                )}
              </Text>
              {projects.length === 0 && (
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="green"
                  onClick={onCreateOpen}
                  size="lg"
                >
                  Create Your First Project
                </Button>
              )}
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project._id} 
                  project={project} 
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditProject}
                  onShare={handleShareProject}
                  showBlockchainInfo={true}
                />
              ))}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>

      {/* All Modals */}
      <CreateProjectModal 
        isOpen={isCreateOpen} 
        onClose={onCreateClose}
        onProjectCreated={handleProjectCreated}
      />
      
      <ProjectDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={onDetailsClose} 
        project={selectedProject} 
      />
      
      <EditProjectModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        project={selectedProject}
        onSave={handleSaveProject}
      />
      
      <ShareProjectModal
        isOpen={isShareOpen}
        onClose={onShareClose}
        project={selectedProject}
      />
    </>
  );
};

export default FarmerProjectsSection;