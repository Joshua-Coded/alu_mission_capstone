"use client";
import React from "react";
import { Project } from "@/lib/projectApi";

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiAward,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiExternalLink,
} from 'react-icons/fi';

interface ProjectSuccessViewProps {
  project: Project;
  blockchainData?: Record<string, unknown> | null;
}

const ProjectSuccessView: React.FC<ProjectSuccessViewProps> = ({
  project,
  blockchainData,
}) => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50)',
    'linear(to-br, purple.900, pink.900)'
  );

  // Safe data extraction with type guards
  const currentFunding = blockchainData?.currentFunding 
    ? String(blockchainData.currentFunding)
    : project.currentFunding?.toFixed(4) || '0';
    
  const fundingGoal = blockchainData?.fundingGoal 
    ? String(blockchainData.fundingGoal)
    : project.fundingGoal?.toFixed(4) || '0';
    
  const contributorCount = blockchainData?.contributorCount 
    ? Number(blockchainData.contributorCount)
    : project.contributorsCount || 0;

  return (
    <VStack spacing={6} align="stretch">
      {/* Success Header */}
      <Box
        bgGradient={bgGradient}
        p={6}
        borderRadius="xl"
        border="2px"
        borderColor="purple.300"
      >
        <VStack spacing={4}>
          <HStack spacing={3}>
            <Icon as={FiAward} boxSize={12} color="purple.500" />
            <VStack align="start" spacing={0}>
              <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="full">
                🎉 FULLY FUNDED
              </Badge>
              <Text fontSize="sm" color="gray.600" mt={2}>
                Goal reached! Funds released to farmer.
              </Text>
            </VStack>
          </HStack>

          <Progress
            value={100}
            size="lg"
            colorScheme="purple"
            borderRadius="full"
            w="full"
          />

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full" pt={4}>
            <Stat textAlign="center">
              <StatLabel fontSize="xs" color="gray.600">Total Raised</StatLabel>
              <StatNumber fontSize="xl" color="purple.600">
                {currentFunding} MATIC
              </StatNumber>
            </Stat>

            <Stat textAlign="center">
              <StatLabel fontSize="xs" color="gray.600">Funding Goal</StatLabel>
              <StatNumber fontSize="xl" color="green.600">
                {fundingGoal} MATIC
              </StatNumber>
            </Stat>

            <Stat textAlign="center">
              <StatLabel fontSize="xs" color="gray.600">Contributors</StatLabel>
              <StatNumber fontSize="xl" color="blue.600">
                {contributorCount}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Success Message */}
      <Alert status="success" borderRadius="lg" variant="subtle">
        <AlertIcon as={FiCheckCircle} boxSize={8} />
        <Box flex="1">
          <AlertTitle fontSize="lg">Project Successfully Funded! 🎉</AlertTitle>
          <AlertDescription fontSize="sm" mt={2}>
            <VStack align="start" spacing={2}>
              <Text>
                This project has reached its funding goal. The smart contract has automatically
                released <strong>{currentFunding} MATIC</strong> to the farmer&apos;s wallet.
              </Text>
              <Text fontWeight="bold" color="green.600">
                Thank you to all {contributorCount} contributors who made this project a success!
              </Text>
            </VStack>
          </AlertDescription>
        </Box>
      </Alert>

      {/* Farmer Wallet Info */}
      {project.farmerWalletAddress && (
        <Box
          p={4}
          bg="green.50"
          borderRadius="lg"
          border="1px"
          borderColor="green.200"
        >
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FiDollarSign} color="green.600" boxSize={5} />
              <Text fontWeight="bold" color="green.700">
                Funds Successfully Delivered
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              The smart contract automatically released funds to the farmer&apos;s wallet:
            </Text>
            <HStack spacing={2} w="full" flexWrap="wrap">
              <Code fontSize="sm" colorScheme="green" p={2} borderRadius="md">
                {project.farmerWalletAddress}
              </Code>
              <Button
                as="a"
                href={`https://polygonscan.com/address/${project.farmerWalletAddress}`}
                target="_blank"
                size="sm"
                variant="link"
                colorScheme="green"
                rightIcon={<FiExternalLink />}
              >
                View on Polygonscan
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      <Divider />

      {/* Project Impact Stats */}
      <Box>
        <Text fontWeight="bold" fontSize="lg" mb={4} color="purple.700">
          Project Impact
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <HStack>
            <Icon as={FiUsers} color="blue.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">Community Support</Text>
              <Text fontWeight="bold">{contributorCount} Contributors</Text>
            </VStack>
          </HStack>

          <HStack>
            <Icon as={FiCalendar} color="orange.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">Project Timeline</Text>
              <Text fontWeight="bold">{project.timeline}</Text>
            </VStack>
          </HStack>

          <HStack>
            <Icon as={FiDollarSign} color="green.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">Funding Achieved</Text>
              <Text fontWeight="bold" color="purple.600">
                {currentFunding} / {fundingGoal} MATIC
              </Text>
            </VStack>
          </HStack>

          <HStack>
            <Icon as={FiCheckCircle} color="purple.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">Project Status</Text>
              <Badge colorScheme="purple">Completed</Badge>
            </VStack>
          </HStack>
        </SimpleGrid>
      </Box>
    </VStack>
  );
};

export default ProjectSuccessView;