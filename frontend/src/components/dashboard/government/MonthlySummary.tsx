// ============================================
// FILE: components/government/MonthlySummary.tsx
// ============================================
import {
    Card,
    CardHeader,
    CardBody,
    Heading,
    VStack,
    Flex,
    Text,
    Divider,
    useColorModeValue,
  } from '@chakra-ui/react';
  
  interface MonthlySummaryProps {
    newProjects: number;
    complianceChecks: number;
    policyUpdates: number;
    platformGrowth: string;
  }
  
  export default function MonthlySummary({
    newProjects,
    complianceChecks,
    policyUpdates,
    platformGrowth,
  }: MonthlySummaryProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
        <CardHeader>
          <Heading size="md" color="purple.600">
            Monthly Summary
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <Flex justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">New Projects</Text>
              <Text fontSize="sm" fontWeight="semibold">{newProjects}</Text>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">Compliance Checks</Text>
              <Text fontSize="sm" fontWeight="semibold">{complianceChecks}</Text>
            </Flex>
            <Flex justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">Policy Updates</Text>
              <Text fontSize="sm" fontWeight="semibold">{policyUpdates}</Text>
            </Flex>
            <Divider />
            <Flex justify="space-between" w="full">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">Platform Growth</Text>
              <Text fontSize="sm" fontWeight="bold" color="green.500">{platformGrowth}</Text>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    );
  }