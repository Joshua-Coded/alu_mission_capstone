import CreateProjectModal from "./CreateProjectModal";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiPlus } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
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
} from '@chakra-ui/react';

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

const FarmerProjectsSection: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const searchParams = useSearchParams();
  
  // Get filter from URL params
  const filterParam = searchParams.get('filter');
  const actionParam = searchParams.get('action');
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Organic Tomatoes 2024',
      progress: 85,
      funding: '$8,500',
      fundingGoal: '$10,000',
      investors: 12,
      phase: 'Growing',
      roi: '22%',
      status: 'active',
      description: 'Premium organic tomatoes using sustainable farming practices',
      expectedHarvest: 'December 2024',
      location: 'Kigali Province',
      images: [
        'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1603833797131-3c0a798d2f8e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop'
      ],
      videos: [
        'https://www.w3schools.com/html/mov_bbb.mp4'
      ]
    },
    {
      id: '2',
      name: 'Sustainable Corn',
      progress: 61,
      funding: '$15,200',
      fundingGoal: '$25,000',
      investors: 18,
      phase: 'Planting',
      roi: '18%',
      status: 'active',
      description: 'High-yield corn varieties with climate-resistant properties',
      expectedHarvest: 'January 2025',
      location: 'Eastern Province',
      images: [
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop'
      ],
      videos: []
    },
    {
      id: '3',
      name: 'Vertical Lettuce Farm',
      progress: 100,
      funding: '$6,000',
      fundingGoal: '$6,000',
      investors: 8,
      phase: 'Completed',
      roi: '25%',
      status: 'completed',
      description: 'Indoor vertical farming system for year-round lettuce production',
      expectedHarvest: 'Completed',
      location: 'Kigali City',
      images: [
        'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1565011523534-747a8601f10a?w=400&h=300&fit=crop'
      ],
      videos: [
        'https://www.w3schools.com/html/movie.mp4'
      ]
    },
    {
      id: '4',
      name: 'Heritage Potatoes',
      progress: 35,
      funding: '$3,500',
      fundingGoal: '$10,000',
      investors: 5,
      phase: 'Planning',
      roi: '20%',
      status: 'funding',
      description: 'Traditional potato varieties with improved resistance',
      expectedHarvest: 'March 2025',
      location: 'Northern Province',
      images: [
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400&h=300&fit=crop'
      ],
      videos: []
    },
    {
      id: '5',
      name: 'Organic Coffee Beans',
      progress: 0,
      funding: '$0',
      fundingGoal: '$20,000',
      investors: 0,
      phase: 'Planning',
      roi: '30%',
      status: 'pending_verification',
      description: 'Premium coffee cultivation with organic certification',
      expectedHarvest: 'June 2025',
      location: 'Western Province',
      images: [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop'
      ],
      videos: []
    },
  ]);

  // Modal controls
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();

  // Filter projects based on URL parameter
  const filteredProjects = useMemo(() => {
    if (!filterParam) return projects; // Show all if no filter
    
    switch (filterParam) {
      case 'active':
        return projects.filter(p => p.status === 'active');
      case 'completed':
        return projects.filter(p => p.status === 'completed');
      case 'funding':
        return projects.filter(p => p.status === 'funding');
      case 'pending':
        return projects.filter(p => p.status === 'pending_verification');
      default:
        return projects;
    }
  }, [projects, filterParam]);

  // Get counts for each status
  const projectCounts = useMemo(() => {
    return {
      all: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      funding: projects.filter(p => p.status === 'funding').length,
      pending: projects.filter(p => p.status === 'pending_verification').length,
    };
  }, [projects]);

  // Auto-open create modal if action=create in URL
  React.useEffect(() => {
    if (actionParam === 'create') {
      onCreateOpen();
    }
  }, [actionParam, onCreateOpen]);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    onDetailsOpen();
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    onEditOpen();
  };

  const handleShareProject = (project: Project) => {
    setSelectedProject(project);
    onShareOpen();
  };

  const handleSaveProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
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
      case 'completed': return 'purple';
      case 'funding': return 'blue';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

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
      <CreateProjectModal isOpen={isCreateOpen} onClose={onCreateClose} />
      
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