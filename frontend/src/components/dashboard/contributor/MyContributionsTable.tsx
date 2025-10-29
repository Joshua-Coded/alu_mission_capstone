// "use client";
// import { FiExternalLink } from "react-icons/fi";

// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Heading,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   TableContainer,
//   Badge,
//   useColorModeValue,
//   Text,
//   Button,
//   HStack,
//   Icon,
//   Link,
// } from '@chakra-ui/react';


// interface Contribution {
//   _id: string;
//   project: {
//     _id: string;
//     title: string;
//     status: string;
//   };
//   contributor?: {
//     firstName: string;
//     lastName: string;
//   };
//   amountMatic: number;
//   transactionHash: string;
//   contributedAt: string;
//   status: 'pending' | 'confirmed' | 'failed';
// }

// interface MyContributionsTableProps {
//   contributions: Contribution[];
//   onViewProject: (projectId: string) => void;
// }

// export default function MyContributionsTable({
//   contributions,
//   onViewProject,
// }: MyContributionsTableProps) {
//   const cardBg = useColorModeValue('white', 'gray.800');
//   const borderColor = useColorModeValue('gray.200', 'gray.600');

//   const getStatusColor = (status: string): string => {
//     const colors: Record<string, string> = {
//       active: 'green',
//       funded: 'purple',
//       closed: 'gray',
//       under_review: 'yellow',
//       submitted: 'blue',
//       rejected: 'red',
//     };
//     return colors[status] || 'gray';
//   };

//   const getContributionStatusColor = (status: string): string => {
//     const colors: Record<string, string> = {
//       confirmed: 'green',
//       pending: 'yellow',
//       failed: 'red',
//     };
//     return colors[status] || 'gray';
//   };

//   const totalContributed = contributions.reduce((sum, c) => sum + c.amountMatic, 0);

//   const formatStatus = (status: string): string => {
//     return status
//       .split('_')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   return (
//     <Card bg={cardBg} border="1px" borderColor={borderColor}>
//       <CardHeader>
//         <HStack justify="space-between">
//           <Heading size="md" color="green.600">
//             My Contributions
//           </Heading>
//           <HStack spacing={2}>
//             <Text fontSize="lg" fontWeight="bold" color="purple.600">
//               {totalContributed.toFixed(4)} MATIC
//             </Text>
//             <Text fontSize="lg" color="purple.500">⬡</Text>
//           </HStack>
//         </HStack>
//       </CardHeader>
//       <CardBody>
//         <TableContainer>
//           <Table variant="simple" size="md">
//             <Thead>
//               <Tr>
//                 <Th>Project</Th>
//                 <Th isNumeric>Amount</Th>
//                 <Th>Date</Th>
//                 <Th>Status</Th>
//                 <Th>Transaction</Th>
//                 <Th>Action</Th>
//               </Tr>
//             </Thead>
//             <Tbody>
//               {contributions.map((contribution) => (
//                 <Tr key={contribution._id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
//                   <Td>
//                     <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
//                       {contribution.project?.title || 'Unknown Project'}
//                     </Text>
//                     <Badge 
//                       colorScheme={getStatusColor(contribution.project?.status)} 
//                       variant="subtle" 
//                       fontSize="xs"
//                       mt={1}
//                     >
//                       {formatStatus(contribution.project?.status || 'unknown')}
//                     </Badge>
//                   </Td>
//                   <Td isNumeric>
//                     <HStack justify="flex-end" spacing={1}>
//                       <Text fontWeight="bold" color="purple.600">
//                         {contribution.amountMatic.toFixed(4)}
//                       </Text>
//                       <Text color="purple.500" fontSize="sm">⬡</Text>
//                     </HStack>
//                     <Text fontSize="xs" color="gray.500" textAlign="right">
//                       MATIC
//                     </Text>
//                   </Td>
//                   <Td>
//                     <Text fontSize="sm">
//                       {new Date(contribution.contributedAt).toLocaleDateString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         year: 'numeric',
//                       })}
//                     </Text>
//                     <Text fontSize="xs" color="gray.500">
//                       {new Date(contribution.contributedAt).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </Text>
//                   </Td>
//                   <Td>
//                     <Badge
//                       colorScheme={getContributionStatusColor(contribution.status)}
//                       fontSize="xs"
//                       px={2}
//                       py={1}
//                       borderRadius="full"
//                     >
//                       {contribution.status.toUpperCase()}
//                     </Badge>
//                   </Td>
//                   <Td>
//                     <Link
//                       href={`https://polygonscan.com/tx/${contribution.transactionHash}`}
//                       isExternal
//                       fontSize="xs"
//                       color="blue.500"
//                       _hover={{ color: 'blue.600', textDecoration: 'underline' }}
//                     >
//                       <HStack spacing={1}>
//                         <Text fontFamily="mono">
//                           {contribution.transactionHash.slice(0, 6)}...
//                           {contribution.transactionHash.slice(-4)}
//                         </Text>
//                         <Icon as={FiExternalLink} boxSize={3} />
//                       </HStack>
//                     </Link>
//                   </Td>
//                   <Td>
//                     <Button
//                       size="sm"
//                       colorScheme="green"
//                       variant="outline"
//                       onClick={() => onViewProject(contribution.project?._id)}
//                     >
//                       View
//                     </Button>
//                   </Td>
//                 </Tr>
//               ))}
//               {contributions.length === 0 && (
//                 <Tr>
//                   <Td colSpan={6} textAlign="center" py={8}>
//                     <Text color="gray.500" mb={4}>
//                       No contributions yet. Start investing in agricultural projects!
//                     </Text>
//                     <Button
//                       colorScheme="green"
//                       size="sm"
//                       onClick={() => window.location.href = '/projects/active'}
//                     >
//                       Browse Projects
//                     </Button>
//                   </Td>
//                 </Tr>
//               )}
//             </Tbody>
//           </Table>
//         </TableContainer>

       
//         {contributions.length > 0 && (
//           <HStack 
//             justify="space-between" 
//             pt={4} 
//             mt={4} 
//             borderTop="1px" 
//             borderColor={borderColor}
//           >
//             <Text fontSize="sm" color="gray.600">
//               Showing {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
//             </Text>
//             <HStack spacing={2}>
//               <Text fontSize="sm" color="gray.600">Total Contributed:</Text>
//               <HStack spacing={1}>
//                 <Text fontSize="md" fontWeight="bold" color="purple.600">
//                   {totalContributed.toFixed(4)} MATIC
//                 </Text>
//                 <Text color="purple.500">⬡</Text>
//               </HStack>
//             </HStack>
//           </HStack>
//         )}
//       </CardBody>
//     </Card>
//   );
// }