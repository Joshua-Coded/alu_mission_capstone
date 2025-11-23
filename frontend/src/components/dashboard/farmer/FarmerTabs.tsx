import ActivityFeed from "./ActivityItem";
import CreateProjectModal from "./CreateProjectModal";
import FarmerProjectsSection from "./FarmerProjectsSection";
import FarmerQuickActions from "./FarmerQuickActions";
import FarmerStatsGrid from "./FarmerStatsGrid";
import ProfileSettings from "@/components/common/ProfileSettings";
import ProjectCard from "@/components/dashboard/farmer/ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project, projectApi } from "@/lib/projectApi";

// File: components/dashboard/farmer/FarmerTabs.tsx

import {
  Box, VStack, HStack, Text, Button, SimpleGrid, Spinner, useToast,
  Input, InputGroup, InputLeftElement, Select, Badge, Icon, Heading,
  Card, CardBody, useDisclosure, Alert, AlertIcon, Grid,
  Container
} from '@chakra-ui/react';
import {
  FiPlus, FiSearch, FiRefreshCw, FiCheckCircle, FiClock,
  FiXCircle, FiAlertCircle, FiPackage,
} from 'react-icons/fi';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  bio: string;
  walletAddress: string;
}

// ============================================
// DASHBOARD TAB - UPDATED WITH ACTIVITY FEED
// ============================================
export const DashboardTab = () => (
  <Container maxW="7xl" p={0}>
    <VStack spacing={6} align="stretch" w="full">
      <FarmerStatsGrid />
      
      {/* Main Content Grid with Activity Feed */}
      <Grid 
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }} 
          gap={6} 
          alignItems="start"
        >
        {/* Left Column - Projects and Quick Actions */}
        <VStack spacing={6} align="stretch">
          <Box w="full">
            <FarmerProjectsSection />
          </Box>
          <FarmerQuickActions />
        </VStack>
        
        {/* Right Column - Activity Feed */}
        <Box position="sticky" top="100px">
          <ActivityFeed limit={8} />
        </Box>
      </Grid>
    </VStack>
  </Container>
);

// ============================================
// ACTIVITY TAB - NEW DEDICATED ACTIVITY PAGE
// ============================================
export const ActivityTab = () => (
  <Container maxW="6xl">
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="lg" mb={2}>Activity Timeline</Heading>
        <Text color="gray.600">
          Track all activities across your farming projects and investments
        </Text>
      </Box>

      {/* Activity Feed with larger limit */}
      <ActivityFeed limit={25} />
    </VStack>
  </Container>
);

// ============================================
// PROJECTS TAB - UPDATED WITH MODAL
// ============================================
export const ProjectsTab = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const router = useRouter();

  // Modal controls
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  const loadProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      console.log('Loading farmer projects...');
      const data = await projectApi.getMyProjects();
      console.log('Projects loaded:', data);
      
      setProjects(data);
      
      // Show success notifications for newly approved projects
      data.forEach(project => {
        if (project.status === 'active' && project.verification?.verifiedAt) {
          const approvedDate = new Date(project.verification.verifiedAt);
          const hoursSinceApproval = (new Date().getTime() - approvedDate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceApproval < 24) {
            toast({
              title: '🎉 Project Approved!',
              description: `"${project.title}" is now active and can receive funding!`,
              status: 'success',
              duration: 10000,
              isClosable: true,
            });
          }
        }
      });
    } catch (error: unknown) {
      console.error('Error loading projects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      setError(errorMessage);    
      toast({ 
        title: 'Error Loading Projects', 
        description: errorMessage, 
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Filter projects based on search and status
  useEffect(() => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    onDetailsOpen();
  };

  const handleCreateProject = () => {
    onCreateOpen();
  };

  const handleProjectCreated = () => {
    onCreateClose();
    loadProjects(false);
    toast({
      title: 'Project Created! 🎉',
      description: 'Your project has been submitted successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleRefresh = () => {
    loadProjects(false);
  };

  // Calculate project statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    pending: projects.filter(p => p.status === 'submitted').length,
    underReview: projects.filter(p => p.status === 'under_review').length,
    funded: projects.filter(p => p.status === 'funded').length,
    rejected: projects.filter(p => p.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green.600';
      case 'submitted': return 'orange.600';
      case 'under_review': return 'yellow.600';
      case 'funded': return 'blue.600';
      case 'rejected': return 'red.600';
      default: return 'gray.600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return FiCheckCircle;
      case 'submitted': return FiClock;
      case 'under_review': return FiPackage;
      case 'funded': return FiCheckCircle;
      case 'rejected': return FiXCircle;
      default: return FiAlertCircle;
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="green.500" />
        <Text mt={4} color="gray.600">Loading your projects...</Text>
      </Box>
    );
  }

  return (
    <>
      <VStack spacing={6} align="stretch" w="full">
        {/* Header Section */}
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="lg">My Projects</Heading>
            <Text color="gray.600" fontSize="sm">
              Manage and track your agricultural projects
            </Text>
          </VStack>
          <HStack>
            <Button 
              leftIcon={<FiRefreshCw />} 
              onClick={handleRefresh} 
              size="sm" 
              variant="outline"
              isLoading={isRefreshing}
              loadingText="Refreshing"
            >
              Refresh
            </Button>
            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="green" 
              onClick={handleCreateProject}
              size="sm"
            >
              Create Project
            </Button>
          </HStack>
        </HStack>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Failed to load projects</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
          </Alert>
        )}

        {/* Statistics Grid */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                  {stats.total}
                </Text>
                <Text fontSize="xs" color="gray.600" textAlign="center">
                  Total Projects
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack spacing={1}>
                <HStack>
                  <Icon as={getStatusIcon('active')} color={getStatusColor('active')} />
                  <Text fontSize="2xl" fontWeight="bold" color={getStatusColor('active')}>
                    {stats.active}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Active
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack spacing={1}>
                <HStack>
                  <Icon as={getStatusIcon('submitted')} color={getStatusColor('submitted')} />
                  <Text fontSize="2xl" fontWeight="bold" color={getStatusColor('submitted')}>
                    {stats.pending}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Pending
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack spacing={1}>
                <HStack>
                  <Icon as={getStatusIcon('under_review')} color={getStatusColor('under_review')} />
                  <Text fontSize="2xl" fontWeight="bold" color={getStatusColor('under_review')}>
                    {stats.underReview}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  In Review
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack spacing={1}>
                <HStack>
                  <Icon as={getStatusIcon('funded')} color={getStatusColor('funded')} />
                  <Text fontSize="2xl" fontWeight="bold" color={getStatusColor('funded')}>
                    {stats.funded}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Funded
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack spacing={1}>
                <HStack>
                  <Icon as={getStatusIcon('rejected')} color={getStatusColor('rejected')} />
                  <Text fontSize="2xl" fontWeight="bold" color={getStatusColor('rejected')}>
                    {stats.rejected}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Rejected
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Search and Filter Section */}
        <Card bg="white" shadow="sm">
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="400px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search projects by title, description, or category..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="white"
                />
              </InputGroup>
              
              <Select 
                maxW="200px" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                bg="white"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending</option>
                <option value="under_review">In Review</option>
                <option value="active">Active</option>
                <option value="funded">Funded</option>
                <option value="rejected">Rejected</option>
              </Select>
              
              <Badge colorScheme="gray" fontSize="sm" px={3} py={1}>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
              </Badge>
            </HStack>
          </CardBody>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card bg="white" shadow="sm">
            <CardBody py={16} textAlign="center">
              <VStack spacing={4}>
                <Icon as={FiPackage} boxSize={12} color="gray.300" />
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                    No projects found
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {projects.length === 0 
                      ? "You haven't created any projects yet. Get started by creating your first project!"
                      : "No projects match your current filters. Try adjusting your search or filters."
                    }
                  </Text>
                </Box>
                {projects.length === 0 && (
                  <Button 
                    colorScheme="green" 
                    leftIcon={<FiPlus />}
                    onClick={handleCreateProject}
                    mt={4}
                  >
                    Create Your First Project
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                onViewDetails={() => handleViewDetails(project)}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreateOpen} 
        onClose={onCreateClose}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={onDetailsClose} 
        project={selectedProject}
        onProjectUpdate={handleRefresh}
      />
    </>
  );
};

// ============================================
// INVENTORY TAB
// ============================================
export const InventoryTab = () => (
  <VStack spacing={6} align="stretch">
    <Heading size="lg">Inventory</Heading>
    <Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card>
  </VStack>
);

// ============================================
// PROFILE TAB
// ============================================
export const ProfileTab = ({ user }: { user: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  walletAddress?: string;
} | null })  => (
  <VStack spacing={6} align="stretch">
    <ProfileSettings
      userType="farmer"
      userData={{
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        location: user?.location || '',
        bio: user?.bio || '',
        walletAddress: user?.walletAddress || '',
      }}
      onSave={async (data) => {
        // Map the ProfileSettings data format to your UserProfileData format
        const mappedData: UserProfileData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phone || '', // ProfileSettings uses 'phone', not 'phoneNumber'
          location: data.location || '',
          bio: data.bio || '',
          walletAddress: '', // ProfileSettings doesn't include walletAddress
        };
        console.log('Save:', mappedData);
      }}
    />
  </VStack> 
);

// ============================================
// PLACEHOLDER TABS
// ============================================
export const InvestmentsTab = () => (
  <VStack spacing={6}><Heading>Investments</Heading><Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card></VStack>
);

export const InvestorsTab = () => (
  <VStack spacing={6}><Heading>Investors</Heading><Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card></VStack>
);

export const AnalyticsTab = () => (
  <VStack spacing={6}><Heading>Analytics</Heading><Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card></VStack>
);

export const ScheduleTab = () => (
  <VStack spacing={6}><Heading>Schedule</Heading><Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card></VStack>
);

export const LocationTab = () => (
  <VStack spacing={6}><Heading>Locations</Heading><Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card></VStack>
);

export const CropsTab = () => (
  <VStack spacing={6}><Heading>Crops</Heading><Card><CardBody py={12}><VStack><Icon as={FiAlertCircle} boxSize={12} color="gray.400" /><Text>Coming soon</Text></VStack></CardBody></Card></VStack>
);