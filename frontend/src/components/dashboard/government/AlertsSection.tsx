// ============================================
// FILE: components/government/AlertsSection.tsx
// ============================================
import {
    Card,
    CardHeader,
    CardBody,
    Heading,
    Flex,
    Button,
    VStack,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Box,
    Text,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { FiSettings } from 'react-icons/fi';
  
  interface AlertItem {
    type: 'warning' | 'info' | 'success' | 'error';
    title: string;
    description: string;
    time: string;
  }
  
  interface AlertsSectionProps {
    alerts: AlertItem[];
  }
  
  export default function AlertsSection({ alerts }: AlertsSectionProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="purple.600">
              System Alerts & Notifications
            </Heading>
            <Button leftIcon={<FiSettings />} colorScheme="purple" size="sm" variant="outline">
              Manage Alerts
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {alerts.map((alert, index) => (
              <Alert key={index} status={alert.type} borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize="sm">{alert.title}</AlertTitle>
                  <AlertDescription fontSize="sm">{alert.description}</AlertDescription>
                  <Text fontSize="xs" color="gray.500" mt={1}>{alert.time}</Text>
                </Box>
              </Alert>
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }
  