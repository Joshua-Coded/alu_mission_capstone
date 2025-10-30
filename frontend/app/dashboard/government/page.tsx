"use client";
import ApprovalActionModal from "@/components/dashboard/government/ApprovalActionModal";
import DashboardHeader from "@/components/dashboard/government/DashboardHeader";
import GovDashboardStats from "@/components/dashboard/government/GovDashboardStats";
import GovernmentProjectDetailsModal from "@/components/dashboard/government/ProjectDetailsModal";
import ProjectsTable from "@/components/dashboard/government/ProjectsTable";
import RejectProjectModal from "@/components/dashboard/government/RejectProjectModal";
import RevisionRequestModal from "@/components/dashboard/government/RevisionRequestModal";
import RouteGuard from "@/components/RouteGuard";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { Project as ApiProject, projectApi } from "@/lib/projectApi";

import {
  Box,
  Container,
  VStack,
  useDisclosure,
  Text,
  Badge,
  HStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';

interface DashboardStats {
  totalProjects: number;
  pendingReview: number;
  underReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  averageProcessingTime: string;
  todaySubmissions: number;
}

interface StatusCount {
  submitted: number;
  under_review: number;
  active: number;
  rejected: number;
  funded: number;
  [key: string]: number;
}

export default function GovernmentDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { address } = useAccount();
  const toast = useToast();

  // Modal states
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const { isOpen: isRevisionOpen, onOpen: onRevisionOpen, onClose: onRevisionClose } = useDisclosure();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [allProjects, setAllProjects] = useState<ApiProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ApiProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔄 Loading government dashboard data...');

      const hasGovernmentRole = user?.role === 'GOVERNMENT_OFFICIAL';
      
      if (!hasGovernmentRole) {
        const errorMsg = `Access denied: Government official role required`;
        console.error('❌', errorMsg);
        setError(errorMsg);
        toast({
          title: 'Access Denied',
          description: 'Government official role required',
          status: 'error',
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      // Load all projects for government dashboard
      const projects = await projectApi.getAllProjectsForGovernment();
      setAllProjects(projects);
      
      console.log(`✅ Loaded ${projects.length} projects`);

    } catch (error: unknown) {
      console.error('❌ Failed to load dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      setError(errorMessage);
      toast({
        title: 'Error loading data',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, toast]);

  const filterProjects = useCallback(() => {
    let filtered = [...allProjects];

    // Filter by tab (status)
    switch (activeTab) {
      case 0: // All
        break;
      case 1: // Pending
        filtered = filtered.filter(p => p.status === 'submitted');
        break;
      case 2: // Under Review
        filtered = filtered.filter(p => p.status === 'under_review');
        break;
      case 3: // Approved
        filtered = filtered.filter(p => p.status === 'active' || p.status === 'funded');
        break;
      case 4: // Rejected
        filtered = filtered.filter(p => p.status === 'rejected');
        break;
      case 5: // My Department
        if (user?.department) {
          filtered = filtered.filter(p => p.department === user.department);
        }
        break;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProjects(filtered);
  }, [allProjects, activeTab, searchQuery, categoryFilter, user?.department]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, loadDashboardData]);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const handleViewDetails = async (projectId: string) => {
    try {
      const apiProject = await projectApi.getProjectById(projectId);
      setSelectedProject(apiProject);
      setIsDetailsModalOpen(true);
    } catch (error: unknown) {
      console.error('❌ Error loading project details:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load project details',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
  };

  const handleQuickApprove = (projectId: string) => {
    const project = allProjects.find(p => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      onApproveOpen();
    }
  };
  
  const handleQuickReject = (projectId: string) => {
    const project = allProjects.find(p => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      onRejectOpen();
    }
  };
  
  const handleRequestRevision = (projectId: string) => {
    const project = allProjects.find(p => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      onRevisionOpen();
    }
  };

  const handleApproveConfirm = async (notes?: string) => {
    if (!selectedProject) return;
    
    try {
      const updatedApiProject = await projectApi.verifyProject(selectedProject._id, notes);
      
      setAllProjects(prev => 
        prev.map(p => p._id === selectedProject._id ? updatedApiProject : p)
      );
      
      setSelectedProject(updatedApiProject);

      toast({
        title: 'Project Approved ✓',
        description: 'Project has been successfully approved',
        status: 'success',
        duration: 3000,
      });
      
      onApproveClose();
      setIsDetailsModalOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Approval Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedProject) return;
    
    try {
      const updatedApiProject = await projectApi.rejectProject(selectedProject._id, reason);
      
      setAllProjects(prev => 
        prev.map(p => p._id === selectedProject._id ? updatedApiProject : p)
      );
      
      setSelectedProject(updatedApiProject);

      toast({
        title: 'Project Rejected',
        description: 'Project has been rejected',
        status: 'success',
        duration: 3000,
      });
      
      onRejectClose();
      setIsDetailsModalOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Rejection Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRevisionConfirm = async (notes: string) => {
    if (!selectedProject) return;
    
    try {
      const updatedApiProject = await projectApi.updateDueDiligence(selectedProject._id, {
        notes: notes,
        status: 'in_progress'
      });
      
      setAllProjects(prev => 
        prev.map(p => p._id === selectedProject._id ? updatedApiProject : p)
      );
      
      setSelectedProject(updatedApiProject);

      toast({
        title: 'Revision Requested',
        description: 'Farmer has been notified',
        status: 'success',
        duration: 3000,
      });
      
      onRevisionClose();
      setIsDetailsModalOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Request Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const calculateStats = (): DashboardStats => {
    const statusCount: StatusCount = {
      submitted: 0,
      under_review: 0,
      active: 0,
      rejected: 0,
      funded: 0,
    };

    allProjects.forEach(project => {
      statusCount[project.status] = (statusCount[project.status] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = allProjects.filter(project => {
      const projectDate = new Date(project.createdAt);
      projectDate.setHours(0, 0, 0, 0);
      return projectDate.getTime() === today.getTime();
    }).length;

    return {
      totalProjects: allProjects.length,
      pendingReview: statusCount.submitted,
      underReview: statusCount.under_review,
      approved: statusCount.active + statusCount.funded,
      rejected: statusCount.rejected,
      needsRevision: allProjects.filter(p => 
        p.dueDiligence?.status === 'in_progress' && 
        p.status === 'under_review'
      ).length,
      averageProcessingTime: "3 days",
      todaySubmissions
    };
  };

  const stats = calculateStats();

  const getTabCount = (index: number): number => {
    switch (index) {
      case 0: return allProjects.length;
      case 1: return stats.pendingReview;
      case 2: return stats.underReview;
      case 3: return stats.approved;
      case 4: return stats.rejected;
      case 5: return allProjects.filter(p => p.department === user?.department).length;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['GOVERNMENT_OFFICIAL']}>
        <WalletConnectionGuard 
          title="Connect Wallet to Government Dashboard"
          description="Connect your wallet to monitor platform activities and review projects."
        >
          <Box minH="100vh" bg="gray.50">
            <DashboardHeader
              firstName={user?.firstName || 'Government'}
              lastName={user?.lastName || 'Official'}
              address={address}
              onLogout={logout}
            />
            <Container maxW="7xl" py={8}>
              <VStack spacing={8} align="center" justify="center" minH="50vh">
                <Spinner size="xl" color="purple.500" thickness="4px" />
                <Text fontSize="lg" fontWeight="medium">Loading dashboard...</Text>
              </VStack>
            </Container>
          </Box>
        </WalletConnectionGuard>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['GOVERNMENT_OFFICIAL']}>
      <WalletConnectionGuard 
        title="Connect Wallet to Government Dashboard"
        description="Connect your wallet to monitor platform activities and review projects."
      >
        <Box minH="100vh" bg="gray.50">
          <DashboardHeader
            firstName={user?.firstName || 'Government'}
            lastName={user?.lastName || 'Official'}
            address={address}
            onLogout={logout}
          />

          <Container maxW="7xl" py={8}>
            <VStack spacing={6} align="stretch">
              {/* Error Alert */}
              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">Error Loading Data</Text>
                    <Text fontSize="sm">{error}</Text>
                  </Box>
                  <Button size="sm" onClick={loadDashboardData} ml={3}>
                    Retry
                  </Button>
                </Alert>
              )}

              {/* Dashboard Stats */}
              <GovDashboardStats {...stats} />

              {/* Search and Filter Bar */}
              <HStack spacing={4}>
                <InputGroup flex={1}>
                  <InputLeftElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search projects by title, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="white"
                  />
                </InputGroup>

                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  bg="white"
                  w="250px"
                >
                  <option value="all">All Categories</option>
                  <option value="VEGETABLE_FARMING">Vegetable Farming</option>
                  <option value="POULTRY_FARMING">Poultry Farming</option>
                  <option value="CROP_PRODUCTION">Crop Production</option>
                  <option value="LIVESTOCK_FARMING">Livestock Farming</option>
                  <option value="FISH_FARMING">Fish Farming</option>
                </Select>

                <Button
                  leftIcon={<FiRefreshCw />}
                  onClick={loadDashboardData}
                  isLoading={isLoading}
                  colorScheme="purple"
                  variant="outline"
                >
                  Refresh
                </Button>
              </HStack>

              {/* Tabs */}
              <Box bg="white" borderRadius="lg" boxShadow="sm">
                <Tabs 
                  colorScheme="purple" 
                  index={activeTab} 
                  onChange={setActiveTab}
                >
                  <TabList px={4} borderBottom="2px" borderColor="gray.100">
                    <Tab fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FiFilter} />
                        <Text>All</Text>
                        <Badge colorScheme="gray">{getTabCount(0)}</Badge>
                      </HStack>
                    </Tab>
                    <Tab fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FiClock} />
                        <Text>Pending</Text>
                        <Badge colorScheme="orange">{getTabCount(1)}</Badge>
                      </HStack>
                    </Tab>
                    <Tab fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FiAlertCircle} />
                        <Text>Under Review</Text>
                        <Badge colorScheme="blue">{getTabCount(2)}</Badge>
                      </HStack>
                    </Tab>
                    <Tab fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FiCheckCircle} />
                        <Text>Approved</Text>
                        <Badge colorScheme="green">{getTabCount(3)}</Badge>
                      </HStack>
                    </Tab>
                    <Tab fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FiXCircle} />
                        <Text>Rejected</Text>
                        <Badge colorScheme="red">{getTabCount(4)}</Badge>
                      </HStack>
                    </Tab>
                    {user?.department && (
                      <Tab fontWeight="medium">
                        <HStack spacing={2}>
                          <Text>My Department</Text>
                          <Badge colorScheme="purple">{getTabCount(5)}</Badge>
                        </HStack>
                      </Tab>
                    )}
                  </TabList>

                  <TabPanels>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <TabPanel key={index} p={0}>
                        {filteredProjects.length === 0 ? (
                          <Box py={12} textAlign="center">
                            <Text color="gray.500" fontSize="lg">
                              No projects found
                            </Text>
                            <Text color="gray.400" fontSize="sm" mt={2}>
                              {searchQuery || categoryFilter !== 'all' 
                                ? 'Try adjusting your filters' 
                                : 'All caught up!'}
                            </Text>
                          </Box>
                        ) : (
                          <ProjectsTable
                            projects={filteredProjects}
                            onViewDetails={handleViewDetails}
                            onQuickApprove={handleQuickApprove}
                            onQuickReject={handleQuickReject}
                            onRequestRevision={handleRequestRevision}
                            onAssignOfficer={() => {}}
                          />
                        )}
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              </Box>
            </VStack>
          </Container>
        </Box>

        {/* Modals */}
        {selectedProject && (
          <>
            <GovernmentProjectDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={handleCloseDetailsModal}
              project={selectedProject}
              onApprove={() => handleQuickApprove(selectedProject._id)}
              onReject={() => handleQuickReject(selectedProject._id)}
              onRequestRevision={() => handleRequestRevision(selectedProject._id)}
            />

            <ApprovalActionModal
              isOpen={isApproveOpen}
              onClose={onApproveClose}
              onConfirm={handleApproveConfirm}
              project={selectedProject}
            />

            <RejectProjectModal
              isOpen={isRejectOpen}
              onClose={onRejectClose}
              onConfirm={handleRejectConfirm}
              project={selectedProject}
            />

            <RevisionRequestModal
              isOpen={isRevisionOpen}
              onClose={onRevisionClose}
              onConfirm={handleRevisionConfirm}
              project={selectedProject}
            />
          </>
        )}
      </WalletConnectionGuard>
    </RouteGuard>
  );
}