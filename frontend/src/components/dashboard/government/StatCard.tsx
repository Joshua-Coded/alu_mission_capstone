// ============================================
// FILE: components/government/StatCard.tsx
// ============================================
import {
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Flex,
    Box,
    Icon,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { IconType } from 'react-icons';
  
  interface StatCardProps {
    label: string;
    value: string;
    change: number;
    icon: IconType;
    color: string;
  }
  
  export default function StatCard({ label, value, change, icon, color }: StatCardProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <Stat>
            <Flex justify="space-between" align="start">
              <Box>
                <StatLabel fontSize="sm" color="gray.500">
                  {label}
                </StatLabel>
                <StatNumber fontSize="2xl" color={`${color}.500`}>
                  {value}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(change)}% from last month
                </StatHelpText>
              </Box>
              <Icon as={icon} boxSize={8} color={`${color}.400`} />
            </Flex>
          </Stat>
        </CardBody>
      </Card>
    );
  }