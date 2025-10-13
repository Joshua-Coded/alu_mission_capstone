import CreateProjectModal from "./CreateProjectModal";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiPlus } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { Project as ApiProject, ProjectStatus, projectApi } from "../../../lib/projectApi";
import { EditProjectModal } from "./EditProjectModal";
import { ShareProjectModal } from "./ShareProjectModal";

// components/dashboard/farmer/FarmerProjectsSection.tsx

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
} from '@chakra-ui/react';

// Map backend Project to frontend Project interface
interface FrontendProject {
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

const FarmerProjectsSection: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const filterParam = searchParams.get('filter');
  const actionParam = searchParams.get('action');
  
  const [selectedProject, setSelectedProject] = useState<FrontendProject | null>(null);
  const [projects, setProjects] = useState<FrontendProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();

  // Convert backend project to frontend format
  const mapApiProjectToFrontend = (apiProject: ApiProject): FrontendProject => {
    return {
      id: apiProject._id,
      name: apiProject.title,
      progress: (apiProject.currentFunding / apiProject.fundingGoal) * 100,
      funding: `$${apiProject.currentFunding.toLocaleString()}`,
      fundingGoal: `$${apiProject.fundingGoal.toLocaleString()}`,
      investors: apiProject.contributorsCount,
      phase: apiProject.status === 'active' ? 'Active' : 
             apiProject.status === 'draft' ? 'Planning' :
             apiProject.status === 'submitted' ? 'Under Review' :
             apiProject.status === 'rejected' ? 'Rejected' : 'Planning',
      roi: '0%', // Calculate based on your business logic
      status: apiProject.status,
      description: apiProject.description,
      expectedHarvest: apiProject.timeline || 'Not specified',
      location: apiProject.location,
      images: apiProject.images || [],
      videos: [], // Add if you have video support
    };
  };

  // Fetch projects from backend
  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Map status filter to backend status
      let statusFilter: ProjectStatus | undefined;
      if (filterParam === 'active') statusFilter = ProjectStatus.ACTIVE;
      if (filterParam === 'completed') statusFilter = ProjectStatus.FUNDED;
      if (filterParam === 'funding') statusFilter = ProjectStatus.ACTIVE;
      if (filterParam === 'pending') statusFilter = ProjectStatus.SUBMITTED;

      const apiProjects = await projectApi.getMyProjects(statusFilter);
      const mappedProjects = apiProjects.map(mapApiProjectToFrontend);
      setProjects(mappedProjects);
    } catch (error: any) {
      toast({
        title: 'Error loading projects',
        description: error.message || 'Failed to load projects',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load projects on mount and when filter changes
  useEffect(() => {
    loadProjects();
  }, [filterParam]);

  // Filter projects based on URL parameter
  const filteredProjects = useMemo(() => {
    if (!filterParam) return projects;
    
    switch (filterParam) {
      case 'active':
        return projects.filter(p => p.status === 'active');
      case 'completed':
        return projects.filter(p => p.status === 'funded' || p.status === 'closed');
      case 'funding':
        return projects.filter(p => p.status === 'active');
      case 'pending':
        return projects.filter(p => p.status === 'submitted' || p.status === 'under_review');
      default:
        return projects;
    }
  }, [projects, filterParam]);

  // Get counts for each status
  const projectCounts = useMemo(() => {
    return {
      all: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'funded' || p.status === 'closed').length,
      funding: projects.filter(p => p.status === 'active').length,
      pending: projects.filter(p => p.status === 'submitted' || p.status === 'under_review').length,
    };
  }, [projects]);

  // Auto-open create modal if action=create in URL
  React.useEffect(() => {
    if (actionParam === 'create') {
      onCreateOpen();
    }
  }, [actionParam, onCreateOpen]);

  const handleViewDetails = (project: FrontendProject) => {
    setSelectedProject(project);
    onDetailsOpen();
  };

  const handleEditProject = (project: FrontendProject) => {
    setSelectedProject(project);
    onEditOpen();
  };

  const handleShareProject = (project: FrontendProject) => {
    setSelectedProject(project);
    onShareOpen();
  };

  const handleSaveProject = (updatedProject: FrontendProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleProjectCreated = () => {
    // Reload projects after creating a new one
    loadProjects();
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
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <Flex justify="center" align="center" minH="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
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
            <VStack align="start" spacing={1}>
              <HStack spacing={3}>
                <Heading size="md" color="brand.600">
                  {getFilterLabel()}
                </Heading>
                <Badge colorScheme={getStatusColor(filterParam || 'all')} px={3} py={1}>
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
                </Badge>
              </HStack>
              {filterParam && (
                <Text fontSize="sm" color="gray.600">
                  Showing {filterParam} projects only
                </Text>
              )}
            </VStack>
            
            <HStack spacing={3}>
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
                colorScheme="brand" 
                size="sm"
                bgGradient="linear(to-r, brand.400, brand.600)"
                _hover={{
                  bgGradient: "linear(to-r, brand.500, brand.700)",
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
                {filterParam 
                  ? `You don't have any ${filterParam} projects yet.`
                  : 'Start by creating your first project.'
                }
              </Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="brand"
                onClick={onCreateOpen}
              >
                Create Your First Project
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditProject}
                  onShare={handleShareProject}
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