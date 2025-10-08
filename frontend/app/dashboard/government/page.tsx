"use client";
import ApprovalActionModal from "@/components/dashboard/government/ApprovalActionModal";
import ApprovalWorkflowTracker from "@/components/dashboard/government/ApprovalWorkflowTracker";
import DashboardHeader from "@/components/dashboard/government/DashboardHeader";
import DueDiligencePanel from "@/components/dashboard/government/DueDiligencePanel";
import GovDashboardStats from "@/components/dashboard/government/GovDashboardStats";
import ProjectsTable from "@/components/dashboard/government/ProjectsTable";
import RejectProjectModal from "@/components/dashboard/government/RejectProjectModal";
import RevisionRequestModal from "@/components/dashboard/government/RevisionRequestModal";
import RouteGuard from "@/components/RouteGuard";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";

// ============================================
// FILE: app/government/dashboard/page.tsx
// Main Government Dashboard - Complete Project Approval System
// ============================================
import {
  Box,
  Container,
  VStack,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Badge,
  HStack,
} from '@chakra-ui/react';

// Import all components

import { 
  Project, 
  ProjectStatus, 
  ApprovalStep,
  ProjectDocument,
  ApprovalHistory,
  DueDiligenceCheck,
  AssignedOfficer,
  ProjectComment
} from '@/types/government.types';

export default function GovernmentDashboard() {
  const { user, logout } = useAuth();
  const { address } = useAccount();

  // Drawer and Modal states
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const { isOpen: isRevisionOpen, onOpen: onRevisionOpen, onClose: onRevisionClose } = useDisclosure();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Simulate fetching projects from API
    const mockProjects: Project[] = [
      {
        id: '1',
        projectName: 'Organic Tomato Farm 2024',
        farmerName: 'Sarah Johnson',
        farmerEmail: 'sarah.johnson@example.com',
        farmerId: 'F-2024-001',
        location: 'Kigali Village',
        district: 'Kigali District',
        fundingRequested: 10000,
        projectType: 'Crop Farming',
        description: 'A comprehensive organic tomato farming project focusing on sustainable practices and high-yield production using modern greenhouse technology.',
        duration: 12,
        expectedYield: '5 tons per season',
        expectedROI: '35% annually',
        status: ProjectStatus.SUBMITTED,
        currentApprovalStep: ApprovalStep.STEP_1_INITIAL_REVIEW,
        priority: 'HIGH',
        submittedAt: new Date('2024-10-01'),
        updatedAt: new Date(),
        dueDate: new Date('2024-10-15'),
        documents: [
          {
            id: 'd1',
            name: 'Land Certificate',
            type: 'PDF',
            category: 'LAND_DOCUMENTS',
            url: '/docs/land-cert.pdf',
            size: '2.4 MB',
            uploadedAt: new Date('2024-10-01'),
            verified: false,
          },
          {
            id: 'd2',
            name: 'Business Plan',
            type: 'PDF',
            category: 'BUSINESS_PLAN',
            url: '/docs/business-plan.pdf',
            size: '5.1 MB',
            uploadedAt: new Date('2024-10-01'),
            verified: false,
          },
        ],
        approvalHistory: [],
        dueDiligenceChecks: [
          {
            id: 'dd1',
            category: 'DOCUMENTATION',
            checkName: 'Verify Land Ownership Documents',
            status: 'PENDING',
            assignedTo: 'John Doe',
            findings: '',
            recommendation: 'APPROVE',
            score: 0,
          },
          {
            id: 'dd2',
            category: 'DOCUMENTATION',
            checkName: 'Review Business Plan Completeness',
            status: 'PENDING',
            assignedTo: 'John Doe',
            findings: '',
            recommendation: 'APPROVE',
            score: 0,
          },
          {
            id: 'dd3',
            category: 'FINANCIAL',
            checkName: 'Financial Viability Assessment',
            status: 'PENDING',
            assignedTo: 'Jane Smith',
            findings: '',
            recommendation: 'APPROVE',
            score: 0,
          },
        ],
        assignedOfficers: [
          {
            id: 'ao1',
            officerId: 'O001',
            officerName: 'John Doe',
            role: 'REVIEWER',
            department: 'Documentation',
            assignedAt: new Date('2024-10-01'),
            taskStatus: 'IN_PROGRESS',
          },
        ],
        comments: [],
        riskScore: 25,
        complianceScore: 0,
      },
      {
        id: '2',
        projectName: 'Sustainable Corn Farming',
        farmerName: 'Mike Chen',
        farmerEmail: 'mike.chen@example.com',
        farmerId: 'F-2024-002',
        location: 'Gasabo Town',
        district: 'Gasabo District',
        fundingRequested: 25000,
        projectType: 'Crop Farming',
        description: 'Large-scale corn production using sustainable farming methods with drip irrigation system.',
        duration: 18,
        expectedYield: '15 tons per harvest',
        expectedROI: '42% annually',
        status: ProjectStatus.UNDER_REVIEW,
        currentApprovalStep: ApprovalStep.STEP_3_LAND_VERIFICATION,
        priority: 'MEDIUM',
        submittedAt: new Date('2024-09-25'),
        updatedAt: new Date(),
        dueDate: new Date('2024-10-20'),
        documents: [],
        approvalHistory: [
          {
            id: 'ah1',
            step: ApprovalStep.STEP_1_INITIAL_REVIEW,
            action: 'MOVED_TO_NEXT_STEP',
            comment: 'Initial review completed successfully. All basic requirements met.',
            officerId: 'O001',
            officerName: 'John Doe',
            officerRole: 'Reviewer',
            timestamp: new Date('2024-09-26'),
          },
          {
            id: 'ah2',
            step: ApprovalStep.STEP_2_DOCUMENTATION,
            action: 'MOVED_TO_NEXT_STEP',
            comment: 'All documents verified and in order.',
            officerId: 'O001',
            officerName: 'John Doe',
            officerRole: 'Reviewer',
            timestamp: new Date('2024-09-28'),
          },
        ],
        dueDiligenceChecks: [
          {
            id: 'dd4',
            category: 'LEGAL',
            checkName: 'Land Title Verification',
            status: 'IN_PROGRESS',
            assignedTo: 'Legal Team',
            findings: '',
            recommendation: 'APPROVE',
            score: 0,
          },
        ],
        assignedOfficers: [
          {
            id: 'ao2',
            officerId: 'O002',
            officerName: 'Jane Smith',
            role: 'INSPECTOR',
            department: 'Land Verification',
            assignedAt: new Date('2024-09-28'),
            taskStatus: 'IN_PROGRESS',
          },
          {
            id: 'ao3',
            officerId: 'O001',
            officerName: 'John Doe',
            role: 'REVIEWER',
            department: 'Documentation',
            assignedAt: new Date('2024-09-25'),
            taskStatus: 'COMPLETED',
          },
        ],
        comments: [
          {
            id: 'c1',
            text: 'Project looks promising. Need to verify land boundaries.',
            authorId: 'O002',
            authorName: 'Jane Smith',
            authorRole: 'Inspector',
            timestamp: new Date('2024-09-29'),
            isInternal: true,
          },
        ],
        riskScore: 35,
        complianceScore: 65,
      },
      {
        id: '3',
        projectName: 'Greenhouse Vegetable Production',
        farmerName: 'Emma Rodriguez',
        farmerEmail: 'emma.r@example.com',
        farmerId: 'F-2024-003',
        location: 'Nyarugenge',
        district: 'Nyarugenge District',
        fundingRequested: 15000,
        projectType: 'Greenhouse',
        description: 'Modern greenhouse facility for year-round vegetable production.',
        duration: 24,
        expectedYield: '8 tons annually',
        expectedROI: '38% annually',
        status: ProjectStatus.DUE_DILIGENCE,
        currentApprovalStep: ApprovalStep.STEP_6_COMPLIANCE,
        priority: 'HIGH',
        submittedAt: new Date('2024-09-20'),
        updatedAt: new Date(),
        dueDate: new Date('2024-10-10'),
        documents: [],
        approvalHistory: [],
        dueDiligenceChecks: [],
        assignedOfficers: [],
        comments: [],
        riskScore: 20,
        complianceScore: 82,
      },
    ];

    setProjects(mockProjects);
  }, []);

  // Calculate dashboard stats
  const stats = {
    totalProjects: projects.length,
    pendingReview: projects.filter(p => p.status === ProjectStatus.SUBMITTED).length,
    underReview: projects.filter(p => p.status === ProjectStatus.UNDER_REVIEW).length,
    approved: projects.filter(p => p.status === ProjectStatus.APPROVED).length,
    rejected: projects.filter(p => p.status === ProjectStatus.REJECTED).length,
    needsRevision: projects.filter(p => p.status === ProjectStatus.REQUIRES_REVISION).length,
    averageProcessingTime: '5.2 days',
    todaySubmissions: 3,
  };

  // Handlers
  const handleViewDetails = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      onDrawerOpen();
    }
  };

  const handleAssignOfficer = (projectId: string) => {
    // Implement officer assignment logic
    console.log('Assign officer to project:', projectId);
  };

  const handleQuickApprove = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      onApproveOpen();
    }
  };

  const handleQuickReject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      onRejectOpen();
    }
  };

  const handleRequestRevision = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      onRevisionOpen();
    }
  };

  const handleApproveStep = async (nextStep: ApprovalStep, comment: string) => {
    if (!selectedProject) return;

    // Update project status
    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          currentApprovalStep: nextStep,
          status: ProjectStatus.UNDER_REVIEW,
          approvalHistory: [
            ...p.approvalHistory,
            {
              id: `ah${Date.now()}`,
              step: p.currentApprovalStep,
              action: 'MOVED_TO_NEXT_STEP' as const,
              comment,
              officerId: user?.id || 'O001',
              officerName: `${user?.firstName} ${user?.lastName}` || 'Officer',
              officerRole: 'Government Official',
              timestamp: new Date(),
            },
          ],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) || null);
  };

  const handleRejectProject = async (reason: string, comment: string, notifyFarmer: boolean) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          status: ProjectStatus.REJECTED,
          approvalHistory: [
            ...p.approvalHistory,
            {
              id: `ah${Date.now()}`,
              step: p.currentApprovalStep,
              action: 'REJECTED' as const,
              comment: `${reason}: ${comment}`,
              officerId: user?.id || 'O001',
              officerName: `${user?.firstName} ${user?.lastName}` || 'Officer',
              officerRole: 'Government Official',
              timestamp: new Date(),
            },
          ],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject(null);
  };

  const handleRequestRevisionSubmit = async (items: string[], comment: string, dueDate: string) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          status: ProjectStatus.REQUIRES_REVISION,
          dueDate: new Date(dueDate),
          approvalHistory: [
            ...p.approvalHistory,
            {
              id: `ah${Date.now()}`,
              step: p.currentApprovalStep,
              action: 'REVISION_REQUESTED' as const,
              comment: `Revisions needed: ${items.join(', ')}. ${comment}`,
              officerId: user?.id || 'O001',
              officerName: `${user?.firstName} ${user?.lastName}` || 'Officer',
              officerRole: 'Government Official',
              timestamp: new Date(),
            },
          ],
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject(null);
  };

  const handleUpdateDueDiligenceCheck = async (
    checkId: string,
    status: string,
    findings: string,
    recommendation: string,
    score: number
  ) => {
    if (!selectedProject) return;

    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        const updatedChecks = p.dueDiligenceChecks.map(check => {
          if (check.id === checkId) {
            return {
              ...check,
              status: status as any,
              findings,
              recommendation: recommendation as any,
              score,
              completedAt: status === 'COMPLETED' ? new Date() : check.completedAt,
            };
          }
          return check;
        });

        // Recalculate compliance score
        const totalScore = updatedChecks.reduce((sum, c) => sum + c.score, 0);
        const complianceScore = updatedChecks.length > 0 ? Math.round(totalScore / updatedChecks.length) : 0;

        return {
          ...p,
          dueDiligenceChecks: updatedChecks,
          complianceScore,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id) || null);
  };

  const handleMoveToNextStep = () => {
    if (selectedProject) {
      onApproveOpen();
    }
  };

  return (
    <RouteGuard allowedRoles={['GOVERNMENT_OFFICIAL']}>
      <WalletConnectionGuard 
        title="Connect Wallet to Government Dashboard"
        description="Connect your wallet to monitor platform activities, review compliance, and manage agricultural investment oversight on the blockchain."
      >
        <Box minH="100vh" bg="gray.50">
          <DashboardHeader
            firstName={user?.firstName || 'Government'}
            lastName={user?.lastName || 'Official'}
            address={address}
            onLogout={logout}
          />

          <Container maxW="7xl" py={8}>
            <VStack spacing={8} align="stretch">
              {/* Dashboard Stats */}
              <GovDashboardStats
                totalProjects={stats.totalProjects}
                pendingReview={stats.pendingReview}
                underReview={stats.underReview}
                approved={stats.approved}
                rejected={stats.rejected}
                needsRevision={stats.needsRevision}
                averageProcessingTime={stats.averageProcessingTime}
                todaySubmissions={stats.todaySubmissions}
              />

              {/* Projects Table */}
              <ProjectsTable
                projects={projects}
                onViewDetails={handleViewDetails}
                onAssignOfficer={handleAssignOfficer}
                onQuickApprove={handleQuickApprove}
                onQuickReject={handleQuickReject}
                onRequestRevision={handleRequestRevision}
              />
            </VStack>
          </Container>
        </Box>

        {/* Project Details Drawer */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="xl">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              {selectedProject && (
                <VStack align="start" spacing={2}>
                  <Text fontSize="lg" fontWeight="bold">{selectedProject.projectName}</Text>
                  <HStack>
                    <Badge colorScheme="purple" fontSize="sm">
                      {selectedProject.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge colorScheme="blue" fontSize="sm">
                      {selectedProject.priority}
                    </Badge>
                    <Badge colorScheme="orange" fontSize="sm">
                      {selectedProject.farmerId}
                    </Badge>
                  </HStack>
                </VStack>
              )}
            </DrawerHeader>

            <DrawerBody>
              {selectedProject && (
                <Tabs colorScheme="purple">
                  <TabList>
                    <Tab>Workflow</Tab>
                    <Tab>Due Diligence</Tab>
                    <Tab>History</Tab>
                    <Tab>Documents</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={0}>
                      <ApprovalWorkflowTracker
                        project={selectedProject}
                        onMoveToNextStep={handleMoveToNextStep}
                      />
                    </TabPanel>

                    <TabPanel px={0}>
                      <DueDiligencePanel
                        project={selectedProject}
                        onUpdateCheck={handleUpdateDueDiligenceCheck}
                      />
                    </TabPanel>

                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" fontWeight="semibold">Approval History</Text>
                        {selectedProject.approvalHistory.length === 0 ? (
                          <Text fontSize="sm" color="gray.500">No history yet</Text>
                        ) : (
                          selectedProject.approvalHistory.map((history) => (
                            <Box key={history.id} p={4} borderWidth="1px" borderRadius="md">
                              <HStack justify="space-between" mb={2}>
                                <Badge colorScheme={
                                  history.action === 'MOVED_TO_NEXT_STEP' ? 'green' :
                                  history.action === 'REJECTED' ? 'red' : 'orange'
                                }>
                                  {history.action.replace(/_/g, ' ')}
                                </Badge>
                                <Text fontSize="xs" color="gray.500">
                                  {new Date(history.timestamp).toLocaleString()}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" fontWeight="medium" mb={1}>
                                {history.step.replace(/_/g, ' ')}
                              </Text>
                              <Text fontSize="sm" color="gray.700">{history.comment}</Text>
                              <Text fontSize="xs" color="gray.500" mt={2}>
                                By {history.officerName} ({history.officerRole})
                              </Text>
                            </Box>
                          ))
                        )}
                      </VStack>
                    </TabPanel>

                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" fontWeight="semibold">Project Documents</Text>
                        {selectedProject.documents.length === 0 ? (
                          <Text fontSize="sm" color="gray.500">No documents uploaded</Text>
                        ) : (
                          selectedProject.documents.map((doc) => (
                            <Box key={doc.id} p={4} borderWidth="1px" borderRadius="md">
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{doc.name}</Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {doc.category.replace(/_/g, ' ')} • {doc.size}
                                  </Text>
                                </VStack>
                                <Badge colorScheme={doc.verified ? 'green' : 'gray'}>
                                  {doc.verified ? 'Verified' : 'Unverified'}
                                </Badge>
                              </HStack>
                            </Box>
                          ))
                        )}
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Approval Modal */}
        {selectedProject && (
          <ApprovalActionModal
            isOpen={isApproveOpen}
            onClose={onApproveClose}
            currentStep={selectedProject.currentApprovalStep}
            projectName={selectedProject.projectName}
            onApprove={handleApproveStep}
          />
        )}

        {/* Reject Modal */}
        {selectedProject && (
          <RejectProjectModal
            isOpen={isRejectOpen}
            onClose={onRejectClose}
            projectName={selectedProject.projectName}
            onReject={handleRejectProject}
          />
        )}

        {/* Revision Request Modal */}
        {selectedProject && (
          <RevisionRequestModal
            isOpen={isRevisionOpen}
            onClose={onRevisionClose}
            projectName={selectedProject.projectName}
            onRequestRevision={handleRequestRevisionSubmit}
          />
        )}
      </WalletConnectionGuard>
    </RouteGuard>
  );
}