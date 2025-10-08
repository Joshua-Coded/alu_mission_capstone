// ============================================
// FILE: components/government/RegionalOverview.tsx
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
    useColorModeValue,
  } from '@chakra-ui/react';
  
  interface RegionalDataItem {
    region: string;
    projects: number;
    funding: string;
    farmers: number;
    investors: number;
  }
  
  interface RegionalOverviewProps {
    data: RegionalDataItem[];
  }
  
  export default function RegionalOverview({ data }: RegionalOverviewProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="purple.600">
            Regional Overview
          </Heading>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Region</Th>
                  <Th isNumeric>Projects</Th>
                  <Th isNumeric>Total Funding</Th>
                  <Th isNumeric>Farmers</Th>
                  <Th isNumeric>Investors</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((region, index) => (
                  <Tr key={index}>
                    <Td fontWeight="medium">{region.region}</Td>
                    <Td isNumeric>{region.projects}</Td>
                    <Td isNumeric fontWeight="medium" color="green.600">{region.funding}</Td>
                    <Td isNumeric>{region.farmers}</Td>
                    <Td isNumeric>{region.investors}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    );
  }