"use client";
import ProjectCard from "@/components/dashboard/farmer/ProjectCard";
import RouteGuard from "@/components/RouteGuard";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import { Project, projectApi } from "@/lib/projectApi";

// import  from "@/components/dashboard/farmer/ProjectCard";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Spinner,
  useToast,
  useColorModeValue,
  Button,
  Icon,
} from '@chakra-ui/react';

export default function FavoritesPage() {
  const router = useRouter();
  const toast = useToast();
  const [favorites, setFavorites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getFavorites();
      setFavorites(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load favorites';
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

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

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
              <Heading size="xl" mb={2}>My Watchlist</Heading>
              <Text color="gray.600">
                Projects you&apos;ve saved for later
              </Text>
            </Box>

            {/* Favorites Grid */}
            {loading ? (
              <VStack spacing={4} py={20}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text color="gray.600">Loading favorites...</Text>
              </VStack>
            ) : favorites.length > 0 ? (
              <>
                <Text fontSize="sm" color="gray.600">
                  {favorites.length} saved project{favorites.length !== 1 ? 's' : ''}
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {favorites.map((project) => (
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
                <Icon as={FiHeart} boxSize={12} color="gray.400" />
                <Text fontSize="lg" color="gray.600">
                  No saved projects yet
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Browse projects and save your favorites
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push('/projects/active')}
                >
                  Browse Projects
                </Button>
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    </RouteGuard>
  );
}