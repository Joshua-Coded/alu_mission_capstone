// ============================================
// FILE: components/government/QuickActions.tsx
// ============================================
import {
    Card,
    CardHeader,
    CardBody,
    Heading,
    Button,
    VStack,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { FiFileText, FiDownload, FiShield, FiSettings } from 'react-icons/fi';
  
  export default function QuickActions() {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
        <CardHeader>
          <Heading size="md" color="purple.600">
            Quick Actions
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={3}>
            <Button leftIcon={<FiFileText />} colorScheme="purple" w="full">
              Generate Report
            </Button>
            <Button leftIcon={<FiDownload />} colorScheme="blue" variant="outline" w="full">
              Export Data
            </Button>
            <Button leftIcon={<FiShield />} colorScheme="orange" variant="outline" w="full">
              Compliance Review
            </Button>
            <Button leftIcon={<FiSettings />} colorScheme="gray" variant="outline" w="full">
              Platform Settings
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }
  