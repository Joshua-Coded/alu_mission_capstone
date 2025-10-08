import { useState } from "react";
import { Project, ProjectStatus } from "@/types/government.types";

// ============================================
// FILE: components/government/ProjectsTable.tsx
// ============================================
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
  Avatar,
  AvatarGroup,
  Tooltip,
  Text,
  Box,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiEye, 
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiX,
  FiEdit
} from 'react-icons/fi';

interface ProjectsTableProps {
  projects: Project[];
  onViewDetails: (projectId: string) => void;
  onAssignOfficer: (projectId: string) => void;
  onQuickApprove: (projectId: string) => void;
  onQuickReject: (projectId: string) => void;
  onRequestRevision: (projectId: string) => void;
}

export default function ProjectsTable({
  projects,
  onViewDetails,
  onAssignOfficer,
  onQuickApprove,
  onQuickReject,
  onRequestRevision,
}: ProjectsTableProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const getStatusColor = (status: ProjectStatus) => {
    const colors = {
      SUBMITTED: 'blue',
      UNDER_REVIEW: 'yellow',
      DUE_DILIGENCE: 'orange',
      PENDING_APPROVAL: 'purple',
      APPROVED: 'green',
      REJECTED: 'red',
      REQUIRES_REVISION: 'pink',
      ON_HOLD: 'gray'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'gray',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red'
    };
    return colors[priority] || 'gray';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.farmerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTimeStatus = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { color: 'red.500', text: 'Overdue' };
    if (daysLeft <= 2) return { color: 'orange.500', text: `${daysLeft}d left` };
    return { color: 'gray.600', text: `${daysLeft}d left` };
  };

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="md" color="purple.600">
              Project Submissions
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {filteredProjects.length} projects found
            </Text>
          </Box>
          <HStack spacing={3} flexWrap="wrap">
            <InputGroup size="sm" w="250px">
              <InputLeftElement pointerEvents="none">
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              size="sm"
              w="160px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              icon={<FiFilter />}
            >
              <option value="ALL">All Status</option>
              <option value={ProjectStatus.SUBMITTED}>Submitted</option>
              <option value={ProjectStatus.UNDER_REVIEW}>Under Review</option>
              <option value={ProjectStatus.DUE_DILIGENCE}>Due Diligence</option>
              <option value={ProjectStatus.PENDING_APPROVAL}>Pending</option>
              <option value={ProjectStatus.APPROVED}>Approved</option>
              <option value={ProjectStatus.REJECTED}>Rejected</option>
              <option value={ProjectStatus.REQUIRES_REVISION}>Needs Revision</option>
            </Select>
            <Select
              size="sm"
              w="130px"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              colorScheme="purple"
              variant="outline"
            >
              Export
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Project Details</Th>
                <Th>Farmer</Th>
                <Th>Location</Th>
                <Th isNumeric>Funding</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Team</Th>
                <Th>Timeline</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProjects.map((project) => {
                const timeStatus = getTimeStatus(project.dueDate);
                return (
                  <Tr key={project.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td fontFamily="mono" fontSize="xs" fontWeight="bold">
                      {project.farmerId}
                    </Td>
                    <Td maxW="200px">
                      <Text fontWeight="medium" noOfLines={1}>
                        {project.projectName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {project.projectType}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontWeight="medium" fontSize="sm">{project.farmerName}</Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{project.farmerEmail}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{project.location}</Text>
                      <Text fontSize="xs" color="gray.500">{project.district}</Text>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="bold" color="green.600">
                        ${project.fundingRequested.toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.500">{project.duration}mo</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(project.status)} variant="subtle" fontSize="xs">
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getPriorityColor(project.priority)} fontSize="xs">
                        {project.priority}
                      </Badge>
                    </Td>
                    <Td>
                      {project.assignedOfficers.length > 0 ? (
                        <AvatarGroup size="xs" max={2}>
                          {project.assignedOfficers.map((officer) => (
                            <Tooltip key={officer.id} label={officer.officerName}>
                              <Avatar name={officer.officerName} size="xs" />
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      ) : (
                        <Button
                          size="xs"
                          leftIcon={<FiUserPlus />}
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => onAssignOfficer(project.id)}
                        >
                          Assign
                        </Button>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="xs" color={timeStatus.color} fontWeight="medium">
                        {timeStatus.text}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(project.dueDate).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<FiEye />} onClick={() => onViewDetails(project.id)}>
                            View Full Details
                          </MenuItem>
                          <MenuItem icon={<FiUserPlus />} onClick={() => onAssignOfficer(project.id)}>
                            Assign Officers
                          </MenuItem>
                          <MenuItem icon={<FiCheckCircle />} onClick={() => onQuickApprove(project.id)} color="green.500">
                            Quick Approve Step
                          </MenuItem>
                          <MenuItem icon={<FiEdit />} onClick={() => onRequestRevision(project.id)} color="orange.500">
                            Request Revision
                          </MenuItem>
                          <MenuItem icon={<FiX />} onClick={() => onQuickReject(project.id)} color="red.500">
                            Reject Project
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
}
