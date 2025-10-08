import { FiCheckCircle, FiClock, FiFileText } from "react-icons/fi";
import { Project } from "@/types/government.types";

// ============================================
// FILE: components/government/ProjectDetailsModal.tsx
// ============================================
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
  Divider,
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
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestRevision: () => void;
}

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  onApprove,
  onReject,
  onRequestRevision,
}: ProjectDetailsModalProps) {
  const cardBg = useColorModeValue('white', 'gray.800');

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Text>{project.projectName}</Text>
            <Badge colorScheme="purple" fontSize="sm">
              {project.status.replace('_', ' ')}
            </Badge>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>Project Details</Tab>
              <Tab>Documents</Tab>
              <Tab>Approval History</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Farmer Name</Text>
                      <Text fontWeight="medium">{project.farmerName}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Email</Text>
                      <Text fontWeight="medium">{project.farmerEmail}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Location</Text>
                      <Text fontWeight="medium">{project.location}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">District</Text>
                      <Text fontWeight="medium">{project.district}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Funding Requested</Text>
                      <Text fontWeight="bold" color="green.600">
                        ${project.fundingRequested.toLocaleString()}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Project Type</Text>
                      <Text fontWeight="medium">{project.projectType}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Duration</Text>
                      <Text fontWeight="medium">{project.duration} months</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.500">Expected Yield</Text>
                      <Text fontWeight="medium">{project.expectedYield}</Text>
                    </GridItem>
                  </Grid>

                  <Divider />

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={2}>Description</Text>
                    <Text>{project.description}</Text>
                  </Box>

                  <Divider />

                  <HStack spacing={3}>
                    <Button colorScheme="green" leftIcon={<FiCheckCircle />} onClick={onApprove}>
                      Approve Project
                    </Button>
                    <Button colorScheme="orange" variant="outline" onClick={onRequestRevision}>
                      Request Revision
                    </Button>
                    <Button colorScheme="red" variant="outline" onClick={onReject}>
                      Reject Project
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {project.documents.map((doc) => (
                    <Box
                      key={doc.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      bg={cardBg}
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <FiFileText />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{doc.name}</Text>
                            <Text fontSize="xs" color="gray.500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack>
                          {doc.verified && (
                            <Badge colorScheme="green">Verified</Badge>
                          )}
                          <Button size="sm" variant="outline">View</Button>
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </TabPanel>

              <TabPanel>
                <List spacing={4}>
                  {project.approvalHistory.map((history) => (
                    <ListItem key={history.id}>
                      <HStack align="start">
                        <ListIcon as={FiClock} color="purple.500" mt={1} />
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack>
                            <Text fontWeight="medium">{history.step.replace('_', ' ')}</Text>
                            <Badge
                              colorScheme={
                                history.action === 'APPROVED' ? 'green' :
                                history.action === 'REJECTED' ? 'red' : 'orange'
                              }
                            >
                              {history.action.replace('_', ' ')}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">{history.comment}</Text>
                          <Text fontSize="xs" color="gray.500">
                            By {history.officerName} • {new Date(history.timestamp).toLocaleString()}
                          </Text>
                        </VStack>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

