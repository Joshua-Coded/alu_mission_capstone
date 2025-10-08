// ============================================
// FILE: components/contributor/MyContributionsTable.tsx
// Shows user's contribution history
// ============================================
import {
    Card,
    CardHeader,
    CardBody,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    useColorModeValue,
    Text,
    Button,
    HStack,
    Icon,
    Link,
  } from '@chakra-ui/react';
  import { FiExternalLink } from 'react-icons/fi';
  import { MyContribution, ProjectStatus } from '@/types/contributor.types';
  
  interface MyContributionsTableProps {
    contributions: MyContribution[];
    onViewProject: (projectId: string) => void;
  }
  
  export default function MyContributionsTable({
    contributions,
    onViewProject,
  }: MyContributionsTableProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    const getStatusColor = (status: ProjectStatus): string => {
      const colors: Record<string, string> = {
        APPROVED_FOR_FUNDING: 'blue',
        FUNDING_IN_PROGRESS: 'yellow',
        FULLY_FUNDED: 'purple',
        IN_PROGRESS: 'orange',
        COMPLETED: 'green',
      };
      return colors[status] || 'gray';
    };
  
    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md" color="green.600">
              My Contributions
            </Heading>
            <Text fontSize="sm" fontWeight="bold" color="green.600">
              Total: ${totalContributed.toLocaleString()}
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Project</Th>
                  <Th>Farmer</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Impact</Th>
                  <Th>Transaction</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contributions.map((contribution) => (
                  <Tr key={contribution.id}>
                    <Td fontWeight="medium">{contribution.projectName}</Td>
                    <Td>{contribution.farmerName}</Td>
                    <Td isNumeric fontWeight="bold" color="green.600">
                      ${contribution.amount.toLocaleString()}
                    </Td>
                    <Td fontSize="xs">{new Date(contribution.contributedAt).toLocaleDateString()}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(contribution.projectStatus)} variant="subtle" fontSize="xs">
                        {contribution.projectStatus.replace(/_/g, ' ')}
                      </Badge>
                    </Td>
                    <Td fontSize="xs" maxW="200px" noOfLines={2}>
                      {contribution.impactSoFar}
                    </Td>
                    <Td>
                      <Link
                        href={`https://etherscan.io/tx/${contribution.transactionHash}`}
                        isExternal
                        fontSize="xs"
                        color="blue.500"
                      >
                        <HStack spacing={1}>
                          <Text fontFamily="mono">
                            {contribution.transactionHash.slice(0, 6)}...{contribution.transactionHash.slice(-4)}
                          </Text>
                          <Icon as={FiExternalLink} boxSize={3} />
                        </HStack>
                      </Link>
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        colorScheme="green"
                        variant="outline"
                        onClick={() => onViewProject(contribution.projectId)}
                      >
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    );
  }