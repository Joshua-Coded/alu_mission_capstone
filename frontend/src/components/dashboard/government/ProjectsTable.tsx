"use client";
import { useState } from "react";
import { Project } from "@/lib/projectApi";

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Tooltip,
  Text,
  Box,
  useToast,
  Spinner,
  Progress,
  Icon,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiEye, 
  FiSearch,
  FiDownload,
  FiCheckCircle,
  FiX,
  FiEdit,
  FiClock,
  FiAlertCircle,
  FiUserCheck,
  FiMapPin,
} from 'react-icons/fi';

// ==================== INTERFACES ====================
interface ProjectsTableProps {
  projects: Project[];
  onViewDetails: (projectId: string) => void;
  onQuickApprove: (projectId: string) => void;
  onQuickReject: (projectId: string) => void;
  onRequestRevision: (projectId: string) => void;
  onAssignOfficer?: (projectId: string) => void;
  loading?: boolean;
}

// ==================== UTILITY FUNCTIONS ====================
const normalizeStatusForDisplay = (status: string): string => {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    submitted: 'blue',
    under_review: 'yellow',
    active: 'green',
    rejected: 'red',
    funded: 'purple',
    closed: 'gray',
  };
  return colors[status.toLowerCase()] || 'gray';
};

const getDepartmentColor = (department?: string): string => {
  if (!department) return 'gray';
  const colors: Record<string, string> = {
    poultry: 'red',
    crops: 'green',
    livestock: 'orange',
    fisheries: 'blue',
    horticulture: 'teal',
    agribusiness: 'purple',
    sustainability: 'pink',
    compliance: 'yellow',
    general: 'gray',
  };
  return colors[department.toLowerCase()] || 'gray';
};

const getDaysAgo = (date: Date | string): string => {
  const now = new Date();
  const submitted = new Date(date);
  const diffTime = Math.abs(now.getTime() - submitted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

// Enhanced location formatting
const formatLocation = (location: string | undefined): string => {
  if (!location) return 'Location not specified';
  
  const trimmedLocation = location.trim();
  
  if (trimmedLocation === '') return 'Location not specified';
  if (trimmedLocation.toLowerCase() === 'unknown') return 'Location not specified';
  if (trimmedLocation.toLowerCase() === 'none') return 'Location not specified';
  if (trimmedLocation.toLowerCase() === 'null') return 'Location not specified';
  
  // If location is just a city name without country, add Rwanda as default
  if (!trimmedLocation.includes(',') && !trimmedLocation.includes('-')) {
    return `${trimmedLocation}, Rwanda`;
  }
  
  return trimmedLocation;
};

// Extract location for filtering (normalize for search)
const getLocationForFilter = (location: string | undefined): string => {
  if (!location) return '';
  return location.split(',')[0].trim().toLowerCase();
};

// ==================== MAIN COMPONENT ====================
export default function ProjectsTable({
  projects = [],
  onViewDetails,
  onQuickApprove,
  onQuickReject,
  onRequestRevision,
  onAssignOfficer,
  loading = false,
}: ProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'funding' | 'status'>('date');
  const toast = useToast();

  const tableBg = useColorModeValue('white', 'gray.800');
  const tableBorder = useColorModeValue('gray.200', 'gray.600');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
  const footerBg = useColorModeValue('purple.50', 'gray.700');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    // Search matching
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (project.title || '').toLowerCase().includes(searchLower) ||
      (project.projectId || '').toLowerCase().includes(searchLower) ||
      (typeof project.farmer === 'object' 
        ? `${project.farmer?.firstName || ''} ${project.farmer?.lastName || ''}`.toLowerCase().includes(searchLower)
        : (project.farmer || '').toLowerCase().includes(searchLower)
      ) ||
      getLocationForFilter(project.location).includes(searchLower) ||
      (project.category || '').toLowerCase().includes(searchLower);

    // Status matching
    const matchesStatus = statusFilter === 'ALL' || 
      project.status.toLowerCase() === statusFilter.toLowerCase();

    // Department matching
    const matchesDepartment = departmentFilter === 'ALL' || 
      (project.department && project.department === departmentFilter);

    // Location matching
    const matchesLocation = locationFilter === 'ALL' || 
      (project.location && getLocationForFilter(project.location) === locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesDepartment && matchesLocation;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'funding':
        return (b.fundingGoal || 0) - (a.fundingGoal || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'date':
      default:
        return new Date(b.submittedAt || b.createdAt).getTime() - 
               new Date(a.submittedAt || a.createdAt).getTime();
    }
  });

  // Action availability
  const canApprove = (project: Project): boolean => {
    return ['submitted', 'under_review'].includes(project.status);
  };

  const canReject = (project: Project): boolean => {
    return ['submitted', 'under_review'].includes(project.status);
  };

  const canRequestRevision = (project: Project): boolean => {
    return ['submitted', 'under_review'].includes(project.status);
  };

  // Get unique values for filters
  const uniqueDepartments = [...new Set(projects.map(p => p.department).filter(Boolean))];
  const uniqueStatuses = [...new Set(projects.map(p => p.status).filter(Boolean))];
  
  // Get unique locations (extract city names)
  const uniqueLocations = [...new Set(
    projects
      .map(p => p.location ? getLocationForFilter(p.location) : null)
      .filter(Boolean)
      .map(loc => loc!.charAt(0).toUpperCase() + loc!.slice(1))
  )].sort();

  // Extract farmer info safely
  const getFarmerInfo = (project: Project) => {
    if (typeof project.farmer === 'object' && project.farmer) {
      return {
        name: `${project.farmer.firstName || ''} ${project.farmer.lastName || ''}`.trim() || 'Unknown Farmer',
        email: project.farmer.email || 'No email',
        id: project.farmer._id || 'Unknown'
      };
    }
    return {
      name: 'Unknown Farmer',
      email: 'No email',
      id: 'Unknown'
    };
  };

  const handleExport = () => {
    if (sortedProjects.length === 0) return;
    
    try {
      // Create CSV content
      const headers = ['Project ID', 'Title', 'Category', 'Status', 'Funding Goal (MATIC)', 'Current Funding (MATIC)', 'Location', 'Department', 'Farmer', 'Submitted Date'];
      const rows = sortedProjects.map(p => {
        const farmerInfo = getFarmerInfo(p);
        return [
          p.projectId || p._id,
          `"${p.title}"`,
          p.category,
          p.status,
          p.fundingGoal || 0,
          p.currentFunding || 0,
          `"${formatLocation(p.location)}"`,
          p.department || 'N/A',
          `"${farmerInfo.name}"`,
          new Date(p.submittedAt || p.createdAt).toLocaleDateString(),
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `projects_export_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported ${sortedProjects.length} projects to CSV`,
        status: 'success',
        duration: 3000,
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Box textAlign="center" py={8} color="gray.500">
            <Spinner size="lg" color="purple.500" mb={4} />
            <Text>Loading projects...</Text>
          </Box>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={tableBg} border="1px" borderColor={tableBorder}>
      <CardHeader pb={4}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" color="purple.600">
              Project Submissions
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {sortedProjects.length} of {projects.length} projects
              {projects.length === 0 && ' - No submissions available'}
            </Text>
          </Box>
          
          <HStack spacing={3} flexWrap="wrap">
            {/* Search */}
            <InputGroup size="sm" w={{ base: 'full', md: '250px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search projects, farmers, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Sort By */}
            <Select
              size="sm"
              w={{ base: 'full', md: '140px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'funding' | 'status')}
            >
              <option value="date">Sort: Date</option>
              <option value="funding">Sort: Funding</option>
              <option value="status">Sort: Status</option>
            </Select>

            {/* Status Filter */}
            <Select
              size="sm"
              w={{ base: 'full', md: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {normalizeStatusForDisplay(status)}
                </option>
              ))}
            </Select>

            {/* Department Filter */}
            {uniqueDepartments.length > 0 && (
              <Select
                size="sm"
                w={{ base: 'full', md: '180px' }}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept?.replace(/_/g, ' ') || 'Unknown'}
                  </option>
                ))}
              </Select>
            )}

            {/* Location Filter */}
            {uniqueLocations.length > 0 && (
              <Select
                size="sm"
                w={{ base: 'full', md: '160px' }}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Select>
            )}

            <Button
              size="sm"
              leftIcon={<FiDownload />}
              colorScheme="purple"
              variant="outline"
              isDisabled={sortedProjects.length === 0}
              onClick={handleExport}
            >
              Export ({sortedProjects.length})
            </Button>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody>
        {sortedProjects.length === 0 ? (
          <Box textAlign="center" py={12} color="gray.500">
            <Icon as={FiSearch} boxSize={12} opacity={0.3} mb={4} />
            <Heading size="sm" mb={2}>No Projects Found</Heading>
            {projects.length === 0 ? (
              <Text fontSize="sm">
                No project submissions yet. Farmers need to submit projects for review.
              </Text>
            ) : (
              <Text fontSize="sm">
                Try adjusting your search or filter criteria above.
              </Text>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table variant="simple" size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th whiteSpace="nowrap">Project ID</Th>
                  <Th whiteSpace="nowrap">Project Details</Th>
                  <Th whiteSpace="nowrap">Farmer</Th>
                  <Th whiteSpace="nowrap">Location</Th>
                  <Th whiteSpace="nowrap">Department</Th>
                  <Th whiteSpace="nowrap" isNumeric>Funding Goal</Th>
                  <Th whiteSpace="nowrap">Progress</Th>
                  <Th whiteSpace="nowrap">Status</Th>
                  <Th whiteSpace="nowrap">Submitted</Th>
                  <Th whiteSpace="nowrap">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedProjects.map((project) => {
                  const projectId = project._id;
                  const farmerInfo = getFarmerInfo(project);
                  const fundingProgress = project.fundingGoal > 0 
                    ? Math.round((project.currentFunding / project.fundingGoal) * 100) 
                    : 0;

                  return (
                    <Tr key={projectId} _hover={{ bg: rowHoverBg }}>
                      {/* Project ID */}
                      <Td fontFamily="mono" fontSize="xs" fontWeight="medium">
                        <Tooltip label={project._id}>
                          <Text>{project.projectId || project._id.slice(-8)}</Text>
                        </Tooltip>
                      </Td>

                      {/* Project Details */}
                      <Td maxW="250px">
                        <Text fontWeight="medium" noOfLines={1}>
                          {project.title || 'Untitled Project'}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {project.category || 'General'}
                        </Text>
                        {project.documents && project.documents.length > 0 && (
                          <HStack spacing={1} mt={1}>
                            <Icon as={FiAlertCircle} color="blue.500" boxSize={3} />
                            <Text fontSize="xs" color="blue.600">
                              {project.documents.length} docs
                            </Text>
                          </HStack>
                        )}
                      </Td>

                      {/* Farmer */}
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiUserCheck} color="purple.500" boxSize={4} />
                          <Box>
                            <Text fontWeight="medium" fontSize="sm">
                              {farmerInfo.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {farmerInfo.email}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>

                      {/* Location - FIXED */}
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={FiMapPin} color="red.500" boxSize={3} />
                          <Box>
                            <Tooltip label={project.location || 'No location provided'}>
                              <Text fontSize="sm" noOfLines={1} fontWeight="medium">
                                {formatLocation(project.location)}
                              </Text>
                            </Tooltip>
                            {!project.location || project.location.toLowerCase() === 'unknown' ? (
                              <Text fontSize="xs" color="orange.500" fontStyle="italic">
                                Location required
                              </Text>
                            ) : (
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {project.location}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      </Td>

                      {/* Department */}
                      <Td>
                        {project.department ? (
                          <Badge 
                            colorScheme={getDepartmentColor(project.department)} 
                            fontSize="xs"
                            px={2} py={1}
                          >
                            {project.department.replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          <Text fontSize="xs" color="gray.400">Not Assigned</Text>
                        )}
                      </Td>

                      {/* Funding Goal */}
                      <Td isNumeric>
                        <Text fontWeight="bold" color="blue.600">
                          {project.fundingGoal?.toFixed(2) || '0'} MATIC
                        </Text>
                        <Text fontSize="xs" color="green.600">
                          {project.currentFunding?.toFixed(2) || '0'} MATIC
                        </Text>
                      </Td>

                      {/* Progress */}
                      <Td>
                        <Box w="100px">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" fontWeight="bold">
                              {fundingProgress}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={fundingProgress} 
                            size="sm" 
                            colorScheme={
                              fundingProgress >= 100 ? 'green' :
                              fundingProgress >= 50 ? 'blue' : 'orange'
                            }
                            borderRadius="full"
                          />
                        </Box>
                      </Td>

                      {/* Status */}
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(project.status)} 
                          variant="solid" 
                          fontSize="xs"
                          px={2} py={1}
                        >
                          {normalizeStatusForDisplay(project.status)}
                        </Badge>
                        {project.dueDiligence?.status === 'in_progress' && (
                          <HStack spacing={1} mt={1}>
                            <Icon as={FiClock} color="yellow.500" boxSize={3} />
                            <Text fontSize="xs" color="yellow.600">
                              Under Review
                            </Text>
                          </HStack>
                        )}
                      </Td>

                      {/* Submitted Date */}
                      <Td>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(project.submittedAt || project.createdAt).toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {getDaysAgo(project.submittedAt || project.createdAt)}
                        </Text>
                      </Td>

                      {/* Actions */}
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="View Details">
                            <IconButton
                              icon={<FiEye />}
                              variant="ghost"
                              size="sm"
                              aria-label="View project"
                              onClick={() => onViewDetails(projectId)}
                              colorScheme="blue"
                            />
                          </Tooltip>

                          {canApprove(project) && (
                            <Tooltip label="Quick Approve">
                              <IconButton
                                icon={<FiCheckCircle />}
                                variant="ghost"
                                size="sm"
                                aria-label="Approve project"
                                onClick={() => onQuickApprove(projectId)}
                                colorScheme="green"
                              />
                            </Tooltip>
                          )}

                          {canReject(project) && (
                            <Tooltip label="Reject Project">
                              <IconButton
                                icon={<FiX />}
                                variant="ghost"
                                size="sm"
                                aria-label="Reject project"
                                onClick={() => onQuickReject(projectId)}
                                colorScheme="red"
                              />
                            </Tooltip>
                          )}
                          
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                              aria-label="More actions"
                            />
                            <MenuList>
                              <MenuItem icon={<FiEye />} onClick={() => onViewDetails(projectId)}>
                                View Full Details
                              </MenuItem>
                              
                              {canApprove(project) && (
                                <MenuItem 
                                  icon={<FiCheckCircle />} 
                                  onClick={() => onQuickApprove(projectId)}
                                  color="green.600"
                                >
                                  Quick Approve
                                </MenuItem>
                              )}
                              
                              {canRequestRevision(project) && (
                                <MenuItem 
                                  icon={<FiEdit />} 
                                  onClick={() => onRequestRevision(projectId)}
                                  color="orange.600"
                                >
                                  Request Revision
                                </MenuItem>
                              )}
                              
                              {canReject(project) && (
                                <MenuItem 
                                  icon={<FiX />} 
                                  onClick={() => onQuickReject(projectId)}
                                  color="red.600"
                                >
                                  Reject Project
                                </MenuItem>
                              )}

                              {onAssignOfficer && (
                                <MenuItem 
                                  icon={<FiUserCheck />} 
                                  onClick={() => onAssignOfficer(projectId)}
                                >
                                  Assign Officer
                                </MenuItem>
                              )}
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Footer Info */}
        {projects.length > 0 && (
          <Box mt={4} p={3} bg={footerBg} borderRadius="md" fontSize="sm" color="gray.700">
            <HStack justify="space-between" flexWrap="wrap">
              <Text>
                Showing <strong>{sortedProjects.length}</strong> of <strong>{projects.length}</strong> total projects
                {statusFilter !== 'ALL' && ` • Status: ${normalizeStatusForDisplay(statusFilter)}`}
                {departmentFilter !== 'ALL' && ` • Dept: ${departmentFilter.replace(/_/g, ' ')}`}
                {locationFilter !== 'ALL' && ` • Location: ${locationFilter}`}
              </Text>
              {searchTerm && (
                <Badge colorScheme="purple" fontSize="xs">
                  Searching: &quot;{searchTerm}&quot;
                </Badge>
              )}
            </HStack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}