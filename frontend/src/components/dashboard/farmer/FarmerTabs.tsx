import FarmerProjectsSection from "./FarmerProjectsSection";
import FarmerQuickActions from "./FarmerQuickActions";
import FarmerStatsGrid from "./FarmerStatsGrid";
import ProfileSettings from "@/components/common/ProfileSettings";
import ProjectCard from "@/components/dashboard/farmer/ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project, projectApi } from "@/lib/projectApi";

// File: components/dashboard/farmer/FarmerTabs.tsx

import {
  Box, VStack, HStack, Text, Button, SimpleGrid, Spinner, useToast,
  Input, InputGroup, InputLeftElement, Select, Badge, Icon, Heading,
  Card, CardBody, useDisclosure,
} from '@chakra-ui/react';
import {
  FiPlus, FiSearch, FiRefreshCw, FiCheckCircle, FiClock,
  FiXCircle, FiAlertCircle, FiPackage,
} from 'react-icons/fi';

// ============================================
// DASHBOARD TAB - 
// ============================================
export const DashboardTab = () => (
  <VStack spacing={6} align="stretch" w="full">
    <FarmerStatsGrid />
    <Box w="full">
      <FarmerProjectsSection />
    </Box>
    <FarmerQuickActions />
  </VStack>
);

// ============================================
// PROJECTS TAB
// ============================================
export const ProjectsTab = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const toast = useToast();
  const router = useRouter();

  // Import these at the top of the file
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getMyProjects();
      setProjects(data);
      
      data.forEach(project => {
        if (project.status === 'active' && project.verification?.verifiedAt) {
          const approvedDate = new Date(project.verification.verifiedAt);
          const hoursSinceApproval = (new Date().getTime() - approvedDate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceApproval < 24) {
            toast({
              title: '🎉 Project Approved!',
              description: `"${project.title}" is now active!`,
              status: 'success',
              duration: 10000,
              isClosable: true,
            });
          }
        }
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...projects];
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter]);

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  // ADD THIS HANDLER
  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    onDetailsOpen();
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    pending: projects.filter(p => p.status === 'submitted').length,
    underReview: projects.filter(p => p.status === 'under_review').length,
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="green.500" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">My Projects</Heading>
          <HStack>
            <Button leftIcon={<FiRefreshCw />} onClick={loadProjects} size="sm" variant="outline">Refresh</Button>
            <Button leftIcon={<FiPlus />} colorScheme="green" onClick={() => router.push('/dashboard/farmer/create-project')}>Create</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card><CardBody><VStack><Text fontSize="2xl" fontWeight="bold">{stats.total}</Text><Text fontSize="xs">Total</Text></VStack></CardBody></Card>
          <Card><CardBody><VStack><Text fontSize="2xl" fontWeight="bold" color="green.600">{stats.active}</Text><Text fontSize="xs">Active</Text></VStack></CardBody></Card>
          <Card><CardBody><VStack><Text fontSize="2xl" fontWeight="bold" color="orange.600">{stats.pending}</Text><Text fontSize="xs">Pending</Text></VStack></CardBody></Card>
          <Card><CardBody><VStack><Text fontSize="2xl" fontWeight="bold" color="yellow.600">{stats.underReview}</Text><Text fontSize="xs">In Review</Text></VStack></CardBody></Card>
        </SimpleGrid>

        <HStack>
          <InputGroup maxW="400px">
            <InputLeftElement><Icon as={FiSearch} /></InputLeftElement>
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </InputGroup>
          <Select maxW="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="submitted">Pending</option>
            <option value="under_review">In Review</option>
            <option value="active">Active</option>
          </Select>
        </HStack>

        {filteredProjects.length === 0 ? (
          <Box textAlign="center" py={20}><Text>No projects</Text></Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((p) => (
              <ProjectCard 
                key={p._id} 
                project={p} 
                onViewDetails={handleViewDetails}  // FIXED!
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* ADD THE MODAL */}
      <ProjectDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={onDetailsClose} 
        project={selectedProject} 
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
export const ProfileTab = ({ user }: { user: any }) => (
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
      onSave={async (data: any) => console.log('Save:', data)}
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