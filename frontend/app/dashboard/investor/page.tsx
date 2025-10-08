"use client";
import AvailableProjectsGrid from "@/components/dashboard/contributor/AvailableProjectsGrid";
import ContributeModal from "@/components/dashboard/contributor/ContributeModal";
import ContributorDashboardStats from "@/components/dashboard/contributor/ContributorDashboardStats";
import MyContributionsTable from "@/components/dashboard/contributor/MyContributionsTable";
import ProjectDetailsDrawer from "@/components/dashboard/contributor/ProjectDetailsDrawer";
import RouteGuard from "@/components/RouteGuard";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";
import { ApprovedProject, MyContribution, ProjectStatus } from "@/types/contributor.types";

import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Badge,
  Text,
  Flex,
  Avatar,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

// Mock data with proper types
const mockProjects: ApprovedProject[] = [
  {
    id: '1',
    projectName: 'Organic Coffee Plantation',
    farmerName: 'Maria Santos',
    farmerEmail: 'maria@example.com',
    farmerId: 'KE-2024-001',
    location: 'Kiambu',
    district: 'Kiambu County',
    projectType: 'Coffee Production',
    description: 'Sustainable coffee production with organic farming methods, focusing on shade-grown arabica coffee that preserves local biodiversity while producing premium beans for export markets.',
    fundingGoal: 50000,
    currentFunding: 35000,
    fundingProgress: 70,
    totalContributors: 45,
    minimumContribution: 500,
    duration: 18,
    expectedYield: '5 tons per harvest',
    sustainabilityScore: 85,
    expectedImpact: 'Creating 20 jobs and supporting 50 families',
    beneficiaries: 50,
    jobsCreated: 20,
    status: ProjectStatus.FUNDING_IN_PROGRESS,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-15'),
    governmentComments: 'Excellent sustainability practices',
    images: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      'https://images.unsplash.com/photo-1587734195503-904ecd4bd6b1?w=800&q=80'
    ],
    videos: ['https://www.youtube.com/embed/HF1H9YOkGpw'],
    documents: [
      { id: '1', name: 'Project Proposal.pdf', type: 'BUSINESS_PLAN', url: '/docs/1.pdf', size: '2.5 MB', verified: true },
      { id: '2', name: 'Environmental Impact.pdf', type: 'TECHNICAL', url: '/docs/2.pdf', size: '1.8 MB', verified: true },
      { id: '3', name: 'Land Certificate.pdf', type: 'LAND_CERTIFICATE', url: '/docs/3.pdf', size: '1.2 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-12-01'),
    fundingDeadline: new Date('2025-06-01'),
  },
  {
    id: '2',
    projectName: 'Hydroponic Vegetable Farm',
    farmerName: 'James Ochieng',
    farmerEmail: 'james@example.com',
    farmerId: 'KE-2024-002',
    location: 'Nakuru',
    district: 'Nakuru County',
    projectType: 'Vegetable Production',
    description: 'Modern hydroponic system for year-round vegetable production using vertical farming techniques and renewable energy to maximize yield while minimizing water usage.',
    fundingGoal: 35000,
    currentFunding: 8000,
    fundingProgress: 23,
    totalContributors: 18,
    minimumContribution: 300,
    duration: 12,
    expectedYield: '3 tons per month',
    sustainabilityScore: 92,
    expectedImpact: 'Providing fresh vegetables to 200 households',
    beneficiaries: 200,
    jobsCreated: 15,
    status: ProjectStatus.APPROVED_FOR_FUNDING,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-20'),
    governmentComments: 'Innovative approach to urban farming',
    images: [
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80'
    ],
    videos: ['https://www.youtube.com/embed/7HoTV_FL7wo'],
    documents: [
      { id: '1', name: 'Business Plan.pdf', type: 'BUSINESS_PLAN', url: '/docs/3.pdf', size: '3.2 MB', verified: true },
      { id: '2', name: 'Technical Specifications.pdf', type: 'TECHNICAL', url: '/docs/4.pdf', size: '2.1 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-12-10'),
    fundingDeadline: new Date('2025-05-01'),
  },
  {
    id: '3',
    projectName: 'Dairy Farming Expansion',
    farmerName: 'Peter Kimani',
    farmerEmail: 'peter@example.com',
    farmerId: 'KE-2024-003',
    location: 'Meru',
    district: 'Meru County',
    projectType: 'Dairy Production',
    description: 'Expanding dairy production with modern milking equipment and improved cattle breeds to increase milk production and quality for local distribution.',
    fundingGoal: 75000,
    currentFunding: 60000,
    fundingProgress: 80,
    totalContributors: 62,
    minimumContribution: 1000,
    duration: 24,
    expectedYield: '500 liters per day',
    sustainabilityScore: 78,
    expectedImpact: 'Supplying milk to local schools and hospitals',
    beneficiaries: 150,
    jobsCreated: 12,
    status: ProjectStatus.FUNDING_IN_PROGRESS,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-01'),
    governmentComments: 'Strong community impact',
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80'
    ],
    videos: [],
    documents: [
      { id: '1', name: 'Financial Projections.pdf', type: 'FINANCIAL', url: '/docs/4.pdf', size: '1.5 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-11-20'),
    fundingDeadline: new Date('2025-04-01'),
  },
  {
    id: '4',
    projectName: 'Avocado Orchard Development',
    farmerName: 'Grace Wanjiku',
    farmerEmail: 'grace@example.com',
    farmerId: 'KE-2024-004',
    location: 'Murang\'a',
    district: 'Murang\'a County',
    projectType: 'Fruit Production',
    description: 'Establishing a 10-acre avocado orchard with Hass variety trees, drip irrigation system, and organic pest management for premium export market.',
    fundingGoal: 45000,
    currentFunding: 12000,
    fundingProgress: 27,
    totalContributors: 28,
    minimumContribution: 400,
    duration: 36,
    expectedYield: '15 tons per season',
    sustainabilityScore: 88,
    expectedImpact: 'Creating employment for 25 people and boosting local economy',
    beneficiaries: 80,
    jobsCreated: 25,
    status: ProjectStatus.FUNDING_IN_PROGRESS,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-18'),
    governmentComments: 'High export potential, excellent water management',
    images: [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80'
    ],
    videos: [],
    documents: [
      { id: '1', name: 'Orchard Plan.pdf', type: 'BUSINESS_PLAN', url: '/docs/5.pdf', size: '2.8 MB', verified: true },
      { id: '2', name: 'Soil Analysis Report.pdf', type: 'TECHNICAL', url: '/docs/6.pdf', size: '1.4 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-12-05'),
    fundingDeadline: new Date('2025-04-15'),
  },
  {
    id: '5',
    projectName: 'Poultry Farm Modernization',
    farmerName: 'Samuel Otieno',
    farmerEmail: 'samuel@example.com',
    farmerId: 'KE-2024-005',
    location: 'Kisumu',
    district: 'Kisumu County',
    projectType: 'Poultry Production',
    description: 'Upgrading poultry infrastructure with automated feeding systems, climate control, and biosecurity measures to increase egg production capacity.',
    fundingGoal: 38000,
    currentFunding: 5000,
    fundingProgress: 13,
    totalContributors: 12,
    minimumContribution: 250,
    duration: 15,
    expectedYield: '20,000 eggs per week',
    sustainabilityScore: 75,
    expectedImpact: 'Providing affordable protein source to 300 families',
    beneficiaries: 300,
    jobsCreated: 18,
    status: ProjectStatus.APPROVED_FOR_FUNDING,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-22'),
    governmentComments: 'Strong demand in local market',
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80',
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800&q=80'
    ],
    videos: ['https://www.youtube.com/embed/Z7SRk34xdrQ'],
    documents: [
      { id: '1', name: 'Modernization Plan.pdf', type: 'BUSINESS_PLAN', url: '/docs/7.pdf', size: '2.2 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-12-12'),
    fundingDeadline: new Date('2025-05-20'),
  },
  {
    id: '6',
    projectName: 'Beekeeping & Honey Production',
    farmerName: 'Lucy Nyambura',
    farmerEmail: 'lucy@example.com',
    farmerId: 'KE-2024-006',
    location: 'Embu',
    district: 'Embu County',
    projectType: 'Apiculture',
    description: 'Establishing 100 modern beehives for organic honey production with value addition through processing and packaging for premium markets.',
    fundingGoal: 28000,
    currentFunding: 22000,
    fundingProgress: 79,
    totalContributors: 38,
    minimumContribution: 200,
    duration: 10,
    expectedYield: '2 tons of honey annually',
    sustainabilityScore: 95,
    expectedImpact: 'Supporting biodiversity and creating sustainable income',
    beneficiaries: 40,
    jobsCreated: 8,
    status: ProjectStatus.FUNDING_IN_PROGRESS,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-08'),
    governmentComments: 'Excellent environmental benefits',
    images: [
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784fbf?w=800&q=80'
    ],
    videos: [],
    documents: [
      { id: '1', name: 'Beekeeping Plan.pdf', type: 'BUSINESS_PLAN', url: '/docs/8.pdf', size: '1.9 MB', verified: true },
      { id: '2', name: 'Environmental Impact.pdf', type: 'TECHNICAL', url: '/docs/9.pdf', size: '1.3 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-11-25'),
    fundingDeadline: new Date('2025-03-30'),
  },
  {
    id: '7',
    projectName: 'Greenhouse Tomato Production',
    farmerName: 'John Kariuki',
    farmerEmail: 'john@example.com',
    farmerId: 'KE-2024-007',
    location: 'Kajiado',
    district: 'Kajiado County',
    projectType: 'Vegetable Production',
    description: 'Climate-controlled greenhouse for year-round tomato production using soilless cultivation and integrated pest management.',
    fundingGoal: 52000,
    currentFunding: 15000,
    fundingProgress: 29,
    totalContributors: 22,
    minimumContribution: 600,
    duration: 14,
    expectedYield: '5 tons per month',
    sustainabilityScore: 86,
    expectedImpact: 'Supplying fresh tomatoes to local markets year-round',
    beneficiaries: 120,
    jobsCreated: 16,
    status: ProjectStatus.FUNDING_IN_PROGRESS,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-12-12'),
    governmentComments: 'Good market access and infrastructure',
    images: [
      'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=800&q=80',
      'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25?w=800&q=80'
    ],
    videos: ['https://www.youtube.com/embed/pPvPB8qJqkI'],
    documents: [
      { id: '1', name: 'Greenhouse Design.pdf', type: 'TECHNICAL', url: '/docs/10.pdf', size: '3.5 MB', verified: true },
      { id: '2', name: 'Financial Plan.pdf', type: 'FINANCIAL', url: '/docs/11.pdf', size: '1.7 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-12-02'),
    fundingDeadline: new Date('2025-04-30'),
  },
  {
    id: '8',
    projectName: 'Tea Farming Cooperative',
    farmerName: 'Margaret Chebet',
    farmerEmail: 'margaret@example.com',
    farmerId: 'KE-2024-008',
    location: 'Kericho',
    district: 'Kericho County',
    projectType: 'Tea Production',
    description: 'Expanding smallholder tea cooperative with processing equipment and farmer training programs to improve quality and increase income.',
    fundingGoal: 68000,
    currentFunding: 42000,
    fundingProgress: 62,
    totalContributors: 56,
    minimumContribution: 800,
    duration: 20,
    expectedYield: '12 tons per harvest',
    sustainabilityScore: 82,
    expectedImpact: 'Benefiting 45 smallholder farmers and their families',
    beneficiaries: 180,
    jobsCreated: 22,
    status: ProjectStatus.FUNDING_IN_PROGRESS,
    verificationStatus: 'VERIFIED',
    approvedBy: 'Ministry of Agriculture',
    approvedAt: new Date('2024-11-28'),
    governmentComments: 'Strong cooperative structure and community support',
    images: [
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
      'https://images.unsplash.com/photo-1563514189-0c3ece8b9cff?w=800&q=80'
    ],
    videos: [],
    documents: [
      { id: '1', name: 'Cooperative Agreement.pdf', type: 'OTHER', url: '/docs/12.pdf', size: '2.0 MB', verified: true },
      { id: '2', name: 'Processing Plan.pdf', type: 'TECHNICAL', url: '/docs/13.pdf', size: '2.4 MB', verified: true },
    ],
    contributors: [],
    createdAt: new Date('2024-11-18'),
    fundingDeadline: new Date('2025-05-15'),
  },
];

const mockContributions: MyContribution[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'Organic Coffee Plantation',
    farmerName: 'Maria Santos',
    amount: 2000,
    contributedAt: new Date('2024-12-10T10:30:00Z'),
    projectStatus: ProjectStatus.FUNDING_IN_PROGRESS,
    impactSoFar: '70% funded, helping create 20 jobs',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  {
    id: '2',
    projectId: '2',
    projectName: 'Hydroponic Vegetable Farm',
    farmerName: 'James Ochieng',
    amount: 1500,
    contributedAt: new Date('2024-12-15T14:20:00Z'),
    projectStatus: ProjectStatus.APPROVED_FOR_FUNDING,
    impactSoFar: 'Early stage - helping with setup',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
];

export default function ContributorDashboard() {
  const { user, logout } = useAuth();
  const { address } = useAccount();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [selectedProject, setSelectedProject] = useState<ApprovedProject | null>(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isContributeOpen, onOpen: onContributeOpen, onClose: onContributeClose } = useDisclosure();

  const handleViewProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      onDetailsOpen();
    }
  };

  const handleContribute = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      onContributeOpen();
    }
  };

  const handleContributeFromDetails = () => {
    onDetailsClose();
    onContributeOpen();
  };

  const handleContributeConfirm = async (amount: number) => {
    // Simulate blockchain transaction
    console.log('Contributing:', amount, 'to project:', selectedProject?.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Contribution Successful!',
      description: `You contributed $${amount} to ${selectedProject?.projectName}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <RouteGuard allowedRoles={['FARMER', 'INVESTOR', 'GOVERNMENT_OFFICIAL']}>
      <WalletConnectionGuard 
        title="Connect Wallet to Contributor Dashboard"
        description="Connect your wallet to contribute to agricultural projects and support farmers with blockchain-secured funding."
      >
        <Box minH="100vh" bg="gray.50">
          {/* Header */}
          <Box bg={cardBg} borderBottom="1px" borderColor={borderColor} py={4}>
            <Container maxW="7xl">
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Avatar size="md" name={`${user?.firstName} ${user?.lastName}`} bg="green.500" />
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color="green.600">
                      Welcome back, {user?.firstName}!
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      Contributor Dashboard • {new Date().toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={3}>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    Verified Contributor
                  </Badge>
                  {address && (
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </Text>
                  )}
                  <ConnectButton />
                  <Button colorScheme="green" variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </HStack>
              </Flex>
            </Container>
          </Box>

          <Container maxW="7xl" py={8}>
            <VStack spacing={8} align="stretch">
              {/* Dashboard Stats */}
              <ContributorDashboardStats
                totalContributed={3500}
                activeProjects={2}
                completedProjects={0}
                livesImpacted={250}
              />

              {/* Available Projects Grid */}
              <AvailableProjectsGrid
                projects={mockProjects}
                onViewProject={handleViewProject}
                onContribute={handleContribute}
              />

              {/* My Contributions Table */}
              <MyContributionsTable
                contributions={mockContributions}
                onViewProject={handleViewProject}
              />
            </VStack>
          </Container>

          {/* Project Details Drawer */}
          <ProjectDetailsDrawer
            isOpen={isDetailsOpen}
            onClose={onDetailsClose}
            project={selectedProject}
            onContribute={handleContributeFromDetails}
          />

          {/* Contribute Modal */}
          {selectedProject && (
            <ContributeModal
              isOpen={isContributeOpen}
              onClose={onContributeClose}
              projectName={selectedProject.projectName}
              minimumContribution={selectedProject.minimumContribution}
              fundingGoal={selectedProject.fundingGoal}
              currentFunding={selectedProject.currentFunding}
              onContributeConfirm={handleContributeConfirm}
            />
          )}
        </Box>
      </WalletConnectionGuard>
    </RouteGuard>
  );
}