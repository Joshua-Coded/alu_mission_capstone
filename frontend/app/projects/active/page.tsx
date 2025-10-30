"use client";
import ContributionModal from "@/components/dashboard/contributor/ContributionModal";
import ProjectCard from "@/components/dashboard/farmer/ProjectCard";
import RouteGuard from "@/components/RouteGuard";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { Project, projectApi } from "@/lib/projectApi";

// import "@/components/dashboard/farmer/ProjectCard";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Spinner,
  useToast,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  HStack,
  Icon,
  useColorModeValue,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

export default function ActiveProjectsPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onClose } = useDisclosure();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getVerifiedProjects();
      const active = data.filter((p: Project) => p.status === 'active');
      setProjects(active);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const handleViewProject = (project: Project) => {
    router.push(`/projects/${project._id}`);
  };

  return (
    <RouteGuard allowedRoles={['INVESTOR']}>
      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            {/* Back Button */}
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => router.push('/dashboard/investor')}
              alignSelf="flex-start"
            >
              Back to Dashboard
            </Button>

            {/* Header */}
            <Box>
              <Heading size="xl" mb={2}>Browse Active Projects</Heading>
              <Text color="gray.600">
                Discover agricultural projects seeking investment
              </Text>
            </Box>

            {/* Search and Filters */}
            <HStack spacing={4}>
              <InputGroup flex={1}>
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by title, location..."
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
                <option value="FRUIT_FARMING">Fruit Farming</option>
              </Select>
            </HStack>

            {/* Projects Grid */}
            {loading ? (
              <VStack spacing={4} py={20}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text color="gray.600">Loading projects...</Text>
              </VStack>
            ) : filteredProjects.length > 0 ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onViewDetails={handleViewProject}
                      showBlockchainInfo={false}
                    />
                  ))}
                </SimpleGrid>
              </>
            ) : (
              <VStack spacing={4} py={20}>
                <Text fontSize="lg" color="gray.600">
                  No projects found
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {searchQuery || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Check back later for new opportunities'}
                </Text>
              </VStack>
            )}
          </VStack>
        </Container>

        {/* Contribution Modal */}
        {selectedProject && (
          <ContributionModal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setSelectedProject(null);
            }}
            project={selectedProject}
            onSuccess={() => {
              fetchProjects();
              setSelectedProject(null);
            }}
          />
        )}
      </Box>
    </RouteGuard>
  );
}