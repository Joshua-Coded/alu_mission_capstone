"use client";
import DueDiligencePanel from "./DueDiligencePanel";
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiClock, FiDollarSign, FiDownload, FiExternalLink, FiFileText, FiImage, FiMapPin, FiTrendingUp, FiUser } from "react-icons/fi";
import { Project, ProjectStatus } from "../../../lib/projectApi";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Grid,
  GridItem,
  Button,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Tooltip,
  Alert,
  AlertIcon,
  Image,
  AspectRatio,
  useToast,
  IconButton,
} from '@chakra-ui/react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
  onAssignOfficer?: (projectId: string) => void;
}

const normalizeProjectStatus = (status: string): string => {
  return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function ProjectDetailsModal({
  isOpen, onClose, project, onApprove, onReject, onRequestRevision, onAssignOfficer
}: ProjectDetailsModalProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  if (!project) return null;

  const getFarmerInfo = () => {
    if (typeof project.farmer === 'object' && project.farmer) {
      return {
        name: `${project.farmer.firstName || ''} ${project.farmer.lastName || ''}`.trim() || 'Unknown',
        email: project.farmer.email || 'No email',
        id: project.farmer._id || 'Unknown',
        phone: project.farmer.phoneNumber || 'No phone',
        location: project.farmer.location || 'Unknown',
        profileImage: project.farmer.profileImage
      };
    }
    return { name: 'Unknown', email: 'No email', id: 'Unknown', phone: 'No phone', location: 'Unknown', profileImage: undefined };
  };

  const farmerInfo = getFarmerInfo();
  const fundingProgress = project.fundingGoal > 0 ? (project.currentFunding / project.fundingGoal) * 100 : 0;

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      [ProjectStatus.SUBMITTED]: 'blue', [ProjectStatus.UNDER_REVIEW]: 'yellow',
      [ProjectStatus.ACTIVE]: 'green', [ProjectStatus.REJECTED]: 'red',
      [ProjectStatus.FUNDED]: 'purple', [ProjectStatus.CLOSED]: 'gray'
    };
    return colors[status] || 'gray';
  };

  const getDepartmentColor = (dept?: string) => {
    if (!dept) return 'gray';
    const colors: Record<string, string> = {
      poultry: 'red', crops: 'green', livestock: 'orange', fisheries: 'blue',
      horticulture: 'teal', agribusiness: 'purple', sustainability: 'pink',
      compliance: 'yellow', general: 'gray'
    };
    return colors[dept.toLowerCase()] || 'gray';
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Unknown';
    return new Date(typeof date === 'string' ? date : date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount);
  };

  const canApprove = [ProjectStatus.SUBMITTED, ProjectStatus.UNDER_REVIEW].includes(project.status);
  const canReject = [ProjectStatus.SUBMITTED, ProjectStatus.UNDER_REVIEW].includes(project.status);
  const canRequestRevision = [ProjectStatus.SUBMITTED, ProjectStatus.UNDER_REVIEW].includes(project.status);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied`, status: 'success', duration: 2000 });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader borderBottom="1px" borderColor={borderColor} bg={useColorModeValue('purple.50', 'gray.900')}>
          <VStack align="start" spacing={2}>
            <HStack justify="space-between" w="full">
              <Text fontSize="2xl" fontWeight="bold" color="purple.700">{project.title}</Text>
              <HStack>
                <Badge colorScheme={getStatusColor(project.status)} fontSize="md" px={3} py={1}>
                  {normalizeProjectStatus(project.status)}
                </Badge>
                {project.department && (
                  <Badge colorScheme={getDepartmentColor(project.department)} fontSize="sm" px={2}>
                    {project.department.replace(/_/g, ' ')}
                  </Badge>
                )}
              </HStack>
            </HStack>
            <HStack spacing={4} fontSize="sm" color="gray.600">
              <Tooltip label="Copy ID">
                <Text cursor="pointer" onClick={() => copyToClipboard(project._id, 'ID')} _hover={{ color: 'purple.600' }}>
                  ID: {project.projectId || project._id.slice(-8)}
                </Text>
              </Tooltip>
              <Text>•</Text>
              <Text>{formatDate(project.submittedAt || project.createdAt)}</Text>
              <Text>•</Text>
              <Text>{project.category}</Text>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs colorScheme="purple" variant="enclosed">
            <TabList>
              <Tab><Icon as={FiTrendingUp} mr={2} />Overview</Tab>
              <Tab><Icon as={FiCheckCircle} mr={2} />Due Diligence</Tab>
              <Tab><Icon as={FiImage} mr={2} />Images</Tab>
              <Tab><Icon as={FiFileText} mr={2} />Documents</Tab>
              <Tab><Icon as={FiClock} mr={2} />History</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Card bg="green.50" border="1px" borderColor="green.200">
                      <CardBody>
                        <Stat>
                          <StatLabel>Funding Goal</StatLabel>
                          <StatNumber color="green.700">{formatCurrency(project.fundingGoal)}</StatNumber>
                          <StatHelpText><Icon as={FiDollarSign} mr={1} />Target</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card bg="blue.50" border="1px" borderColor="blue.200">
                      <CardBody>
                        <Stat>
                          <StatLabel>Current Funding</StatLabel>
                          <StatNumber color="blue.700">{formatCurrency(project.currentFunding)}</StatNumber>
                          <StatHelpText><Icon as={FiTrendingUp} mr={1} />{fundingProgress.toFixed(1)}%</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card bg="purple.50" border="1px" borderColor="purple.200">
                      <CardBody>
                        <Stat>
                          <StatLabel>Contributors</StatLabel>
                          <StatNumber color="purple.700">{project.contributorsCount || 0}</StatNumber>
                          <StatHelpText><Icon as={FiUser} mr={1} />Supporters</StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {project.fundingGoal > 0 && (
                    <Card border="2px" borderColor={fundingProgress >= 100 ? 'green.300' : 'blue.300'}>
                      <CardBody>
                        <VStack spacing={3}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold">Funding Progress</Text>
                            <Text fontWeight="bold" color={fundingProgress >= 100 ? 'green.600' : 'blue.600'}>
                              {formatCurrency(project.currentFunding)} / {formatCurrency(project.fundingGoal)}
                            </Text>
                          </HStack>
                          <Progress value={Math.min(fundingProgress, 100)} colorScheme={fundingProgress >= 100 ? "green" : "blue"}
                            size="lg" w="full" borderRadius="full" hasStripe isAnimated={fundingProgress < 100} />
                          <HStack justify="space-between" w="full" fontSize="sm">
                            <Text color="gray.600">{fundingProgress.toFixed(1)}% funded</Text>
                            <HStack><Icon as={FiUser} color="purple.500" /><Text>{project.contributorsCount || 0} contributors</Text></HStack>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                  <Card>
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        <GridItem>
                          <VStack align="start" spacing={3}>
                            <HStack><Icon as={FiUser} color="purple.500" boxSize={5} /><Text fontWeight="bold">Farmer</Text></HStack>
                            <HStack pl={8} align="start" spacing={4}>
                              {farmerInfo.profileImage && <Avatar size="lg" src={farmerInfo.profileImage} name={farmerInfo.name} />}
                              <VStack align="start" spacing={1}>
                                <Text><strong>Name:</strong> {farmerInfo.name}</Text>
                                <Text cursor="pointer" onClick={() => copyToClipboard(farmerInfo.email, 'Email')} _hover={{ color: 'purple.600' }}>
                                  <strong>Email:</strong> {farmerInfo.email}
                                </Text>
                                <Text><strong>Phone:</strong> {farmerInfo.phone}</Text>
                                <Text><strong>Location:</strong> {farmerInfo.location}</Text>
                              </VStack>
                            </HStack>
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={3}>
                            <HStack><Icon as={FiMapPin} color="purple.500" boxSize={5} /><Text fontWeight="bold">Location</Text></HStack>
                            <VStack align="start" spacing={1} pl={8}>
                              <Text><strong>Location:</strong> {project.location}</Text>
                              <HStack><Text><strong>Department:</strong></Text>
                                <Badge colorScheme={getDepartmentColor(project.department)}>
                                  {project.department?.replace(/_/g, ' ') || 'GENERAL'}
                                </Badge>
                              </HStack>
                              <Text><strong>Category:</strong> {project.category}</Text>
                              <Text><strong>Timeline:</strong> {project.timeline || 'Not specified'}</Text>
                            </VStack>
                          </VStack>
                        </GridItem>
                      </Grid>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack><Icon as={FiFileText} color="purple.500" boxSize={5} /><Text fontWeight="bold">Description</Text></HStack>
                        <Text pl={8} whiteSpace="pre-wrap">{project.description || 'No description'}</Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg="purple.50" border="2px" borderColor="purple.300">
                    <CardBody>
                      <VStack spacing={4}>
                        <Text fontWeight="bold">Actions</Text>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3} w="full">
                          {canApprove && <Button colorScheme="green" leftIcon={<FiCheckCircle />} onClick={onApprove} size="lg" w="full">Approve</Button>}
                          {canRequestRevision && <Button colorScheme="orange" leftIcon={<FiAlertTriangle />} onClick={onRequestRevision} size="lg" w="full">Request Revision</Button>}
                          {canReject && <Button colorScheme="red" leftIcon={<FiAlertTriangle />} onClick={onReject} size="lg" w="full">Reject</Button>}
                          {onAssignOfficer && <Button colorScheme="blue" leftIcon={<FiUser />} onClick={() => onAssignOfficer(project._id)} size="lg" w="full">Assign Officer</Button>}
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              <TabPanel>
                <DueDiligencePanel project={project} onUpdate={(p) => console.log('Updated:', p)} />
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                  {(!project.images || project.images.length === 0) ? (
                    <Alert status="info"><AlertIcon />No images uploaded</Alert>
                  ) : (
                    <>
                      <Text fontWeight="bold">Project Images ({project.images.length})</Text>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {project.images.map((url, i) => (
                          <Card key={i}>
                            <AspectRatio ratio={16 / 9}>
                              <Image src={url} alt={`Image ${i + 1}`} objectFit="cover" fallback={
                                <Box bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                                  <Icon as={FiImage} boxSize={12} color="gray.400" />
                                </Box>
                              } />
                            </AspectRatio>
                            <CardBody p={2}>
                              <HStack justify="space-between">
                                <Text fontSize="xs">Image {i + 1}</Text>
                                <Button as="a" href={url} target="_blank" size="xs" leftIcon={<FiExternalLink />} colorScheme="purple" variant="ghost">View</Button>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                  {(!project.documents || project.documents.length === 0) ? (
                    <Alert status="info"><AlertIcon />No documents uploaded</Alert>
                  ) : (
                    <>
                      <Text fontWeight="bold">Documents ({project.documents.length})</Text>
                      {project.documents.map((doc, i) => (
                        <Card key={i} w="full">
                          <CardBody>
                            <HStack justify="space-between">
                              <HStack spacing={4}>
                                <Icon as={FiFileText} fontSize="2xl" color="purple.500" />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{doc.name}</Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {doc.name.split('.').pop()?.toUpperCase()} • {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'No date'}
                                  </Text>
                                </VStack>
                              </HStack>
                              <HStack>
                                <Button size="sm" colorScheme="purple" leftIcon={<FiExternalLink />} as="a" href={doc.url} target="_blank" isDisabled={!doc.url}>View</Button>
                                <IconButton icon={<FiDownload />} size="sm" aria-label="Download" as="a" href={doc.url} download isDisabled={!doc.url} />
                              </HStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4}>
                  <Card w="full">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Text fontWeight="bold">Timeline</Text>
                        <VStack align="start" spacing={2} pl={4}>
                          <HStack><Icon as={FiCalendar} color="blue.500" /><Text fontSize="sm">Created: {formatDate(project.createdAt)}</Text></HStack>
                          {project.submittedAt && <HStack><Icon as={FiCheckCircle} color="green.500" /><Text fontSize="sm">Submitted: {formatDate(project.submittedAt)}</Text></HStack>}
                          {project.dueDiligence?.startedAt && <HStack><Icon as={FiClock} color="yellow.500" /><Text fontSize="sm">Review Started: {formatDate(project.dueDiligence.startedAt)}</Text></HStack>}
                          {project.dueDiligence?.completedAt && <HStack><Icon as={FiCheckCircle} color="green.500" /><Text fontSize="sm">Review Done: {formatDate(project.dueDiligence.completedAt)}</Text></HStack>}
                          {project.verification?.verifiedAt && <HStack><Icon as={FiCheckCircle} color="green.500" /><Text fontSize="sm">Approved: {formatDate(project.verification.verifiedAt)}</Text></HStack>}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}