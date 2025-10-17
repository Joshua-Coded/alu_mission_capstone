import { useState } from "react";
import { Project } from "@/lib/projectApi";

// ============================================
// FILE: components/dashboard/government/QuickActions.tsx
// Quick access panel for common government official tasks
// ============================================
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  Icon,
  HStack,
  Badge,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiDownload, 
  FiFilter,
  FiChevronDown,
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiCheckCircle,
} from 'react-icons/fi';

interface QuickActionsProps {
  projects: Project[];
  pendingCount: number;
  onRefresh?: () => void;
}

export default function QuickActions({ projects, pendingCount, onRefresh }: QuickActionsProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reportType, setReportType] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate CSV export
  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Project ID', 'Title', 'Category', 'Status', 'Funding Goal', 'Location', 'Submitted Date'];
      const rows = projects.map(p => [
        p.projectId || p._id,
        `"${p.title}"`,
        p.category,
        p.status,
        p.fundingGoal,
        `"${p.location}"`,
        new Date(p.submittedAt || p.createdAt).toLocaleDateString(),
      ]);

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
        description: `Exported ${projects.length} projects to CSV`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Generate JSON export
  const handleExportJSON = () => {
    try {
      const jsonContent = JSON.stringify(projects, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `projects_export_${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: 'Exported projects to JSON',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Calculate report metrics
      const totalProjects = projects.length;
      const approvedProjects = projects.filter(p => p.status === 'active' || p.status === 'funded').length;
      const pendingProjects = projects.filter(p => p.status === 'submitted').length;
      const rejectedProjects = projects.filter(p => p.status === 'rejected').length;
      const totalFunding = projects.reduce((sum, p) => sum + p.fundingGoal, 0);

      let reportContent = '';

      switch (reportType) {
        case 'summary':
          reportContent = `
GOVERNMENT DASHBOARD - SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

==================================
OVERVIEW
==================================
Total Projects: ${totalProjects}
Approved Projects: ${approvedProjects}
Pending Review: ${pendingProjects}
Rejected Projects: ${rejectedProjects}
Total Funding Goal: $${totalFunding.toLocaleString()}
Approval Rate: ${totalProjects > 0 ? ((approvedProjects / totalProjects) * 100).toFixed(1) : 0}%

==================================
PROJECT BREAKDOWN BY STATUS
==================================
${projects.reduce((acc, p) => {
  acc[p.status] = (acc[p.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>).toString()}

==================================
PROJECT BREAKDOWN BY CATEGORY
==================================
${Object.entries(projects.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>)).map(([cat, count]) => `${cat}: ${count}`).join('\n')}
          `.trim();
          break;

        case 'pending':
          reportContent = `
PENDING PROJECTS REPORT
Generated: ${new Date().toLocaleString()}

Total Pending: ${pendingProjects}

${projects
  .filter(p => p.status === 'submitted')
  .map((p, i) => `
${i + 1}. ${p.title}
   Category: ${p.category}
   Location: ${p.location}
   Funding Goal: $${p.fundingGoal.toLocaleString()}
   Submitted: ${new Date(p.submittedAt || p.createdAt).toLocaleDateString()}
`).join('\n')}
          `.trim();
          break;

        case 'approved':
          reportContent = `
APPROVED PROJECTS REPORT
Generated: ${new Date().toLocaleString()}

Total Approved: ${approvedProjects}
Total Funding: $${projects.filter(p => p.status === 'active' || p.status === 'funded').reduce((sum, p) => sum + p.fundingGoal, 0).toLocaleString()}

${projects
  .filter(p => p.status === 'active' || p.status === 'funded')
  .map((p, i) => `
${i + 1}. ${p.title}
   Category: ${p.category}
   Location: ${p.location}
   Funding Goal: $${p.fundingGoal.toLocaleString()}
   Status: ${p.status}
   Approved: ${p.verification?.verifiedAt ? new Date(p.verification.verifiedAt).toLocaleDateString() : 'N/A'}
`).join('\n')}
          `.trim();
          break;
      }

      // Download as text file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${Date.now()}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Report Generated',
        description: `${reportType} report has been downloaded`,
        status: 'success',
        duration: 3000,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Report Generation Failed',
        description: 'Failed to generate report',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter to pending only
  const handleFilterPending = () => {
    toast({
      title: 'Filter Applied',
      description: 'Showing pending projects only',
      status: 'info',
      duration: 2000,
    });
    // This would typically trigger a filter in the parent component
  };

  return (
    <>
      <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="purple.600">
              Quick Actions
            </Heading>
            {pendingCount > 0 && (
              <Badge colorScheme="orange" fontSize="xs">
                {pendingCount} pending
              </Badge>
            )}
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3}>
            {/* Generate Report */}
            <Button
              leftIcon={<Icon as={FiFileText} />}
              colorScheme="purple"
              w="full"
              onClick={onOpen}
              size="sm"
            >
              Generate Report
            </Button>

            {/* Export Menu */}
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<Icon as={FiDownload} />}
                rightIcon={<Icon as={FiChevronDown} />}
                colorScheme="blue"
                variant="outline"
                w="full"
                size="sm"
              >
                Export Data
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiDownload />} onClick={handleExportCSV}>
                  Export as CSV
                </MenuItem>
                <MenuItem icon={<FiDownload />} onClick={handleExportJSON}>
                  Export as JSON
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Quick Stats */}
            <Card w="full" bg={useColorModeValue('purple.50', 'gray.700')} borderWidth="1px">
              <CardBody py={3}>
                <VStack spacing={2} align="stretch" fontSize="sm">
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiBarChart2} color="purple.500" boxSize={4} />
                      <Text color="gray.700">Total Projects</Text>
                    </HStack>
                    <Badge colorScheme="purple">{projects.length}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
                      <Text color="gray.700">Approved</Text>
                    </HStack>
                    <Badge colorScheme="green">
                      {projects.filter(p => p.status === 'active' || p.status === 'funded').length}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FiCalendar} color="orange.500" boxSize={4} />
                      <Text color="gray.700">Pending</Text>
                    </HStack>
                    <Badge colorScheme="orange">{pendingCount}</Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                leftIcon={<Icon as={FiFilter} />}
                colorScheme="gray"
                variant="outline"
                w="full"
                size="sm"
                onClick={onRefresh}
              >
                Refresh Data
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Report Generation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Report Type</FormLabel>
              <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="summary">Summary Report</option>
                <option value="pending">Pending Projects Report</option>
                <option value="approved">Approved Projects Report</option>
              </Select>
              <Text fontSize="xs" color="gray.600" mt={2}>
                {reportType === 'summary' && 'Complete overview of all projects and statistics'}
                {reportType === 'pending' && 'Detailed list of all pending projects awaiting review'}
                {reportType === 'approved' && 'List of all approved projects with funding details'}
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleGenerateReport}
              isLoading={isGenerating}
              leftIcon={<FiFileText />}
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}