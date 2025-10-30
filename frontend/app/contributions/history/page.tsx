"use client";
import RouteGuard from "@/components/RouteGuard";
import contributionApi, { Contribution } from "@/lib/contributionApi";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { 
  FiArrowLeft, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiDollarSign, 
  FiXCircle,
  FiExternalLink,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  useToast,
  useColorModeValue,
  Button,
  Card,
  CardBody,
  Badge,
  Icon,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Input,
  Select,
  Link,
  Code,
} from '@chakra-ui/react';

interface ContributionStats {
  total: number;
  totalAmount: number;
  confirmed: number;
  pending: number;
}

export default function ContributionHistoryPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ContributionStats>({ 
    total: 0, 
    totalAmount: 0,
    confirmed: 0,
    pending: 0,
  });
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch ALL contributions without pagination for accurate stats
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const result = await contributionApi.getMyContributions(1, 1000, status); // Increased limit to get all data
      
      console.log('📊 Contributions API Response:', result); // Debug log
      
      if (result.success && result.data) {
        const allContributions = result.data.contributions;
        setContributions(allContributions);
        setTotalPages(result.data.pages);
        
        // Calculate stats from ALL contributions
        const totalAmount = allContributions.reduce((sum: number, c: Contribution) => {
          return sum + (c.amountMatic || c.amount || 0);
        }, 0);
        
        const confirmedContributions = allContributions.filter(
          (c: Contribution) => c.status === 'confirmed'
        );
        const pendingContributions = allContributions.filter(
          (c: Contribution) => c.status === 'pending'
        );
        
        setStats({
          total: result.data.total || allContributions.length,
          totalAmount: totalAmount,
          confirmed: confirmedContributions.length,
          pending: pendingContributions.length,
        });

        console.log('💰 Calculated Stats:', {
          total: result.data.total || allContributions.length,
          totalAmount,
          confirmed: confirmedContributions.length,
          pending: pendingContributions.length,
          contributions: allContributions.map(c => ({ 
            amountMatic: c.amountMatic, 
            amount: c.amount,
            status: c.status 
          }))
        });
      }
    } catch (err: unknown) {
      console.error('Error fetching contributions:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load contributions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, toast]);

  const applyFilters = useCallback(() => {
    let filtered = [...contributions];

    if (searchTerm) {
      filtered = filtered.filter((c) => {
        const projectTitle = c.project?.title?.toLowerCase() || '';
        const txHash = c.transactionHash?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return projectTitle.includes(search) || txHash.includes(search);
      });
    }

    setFilteredContributions(filtered);
  }, [contributions, searchTerm]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions, currentPage]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const formatMatic = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) {
      return '0.0000';
    }
    return amount.toFixed(4);
  };

  // Fixed date formatting - use same logic as ProjectDetailsPage
  const formatDate = (contribution: Contribution) => {
    const dateString = contribution.contributedAt || contribution.createdAt || (contribution as unknown as Record<string, unknown>).date as string;
    
    if (!dateString) {
      console.log('❌ No date field found for contribution:', contribution._id, contribution);
      return 'Date not available';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('❌ Invalid date:', dateString, 'for contribution:', contribution._id);
        return 'Invalid Date';
      }
      
      console.log('✅ Formatted date:', dateString, '->', date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Date formatting error:', error, 'Date string:', dateString);
      return 'Date not available';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return FiCheckCircle;
      case 'pending': return FiClock;
      case 'failed': return FiXCircle;
      default: return FiClock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContributions();
    toast({
      title: 'Data Refreshed',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExportCSV = () => {
    const csvData = filteredContributions.map(c => ({
      Date: formatDate(c),
      Project: c.project?.title || 'N/A',
      Amount: c.amountMatic || c.amount || 0,
      Currency: 'MATIC',
      Status: c.status,
      TransactionHash: c.transactionHash || 'N/A',
    }));
  
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <RouteGuard allowedRoles={['INVESTOR']}>
      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="start">
              <Box>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  onClick={() => router.push('/dashboard/investor')}
                  mb={4}
                >
                  Back to Dashboard
                </Button>
                <Heading size="xl" mb={2}>Investment History</Heading>
                <Text color="gray.600">
                  Track all your contributions and their status on the blockchain
                </Text>
              </Box>
              <Button
                leftIcon={<Icon as={FiRefreshCw} />}
                variant="outline"
                onClick={handleRefresh}
                isLoading={refreshing}
                size="sm"
              >
                Refresh
              </Button>
            </Flex>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2}>
                        <StatLabel color="gray.600" fontSize="sm">Total Investments</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                          {stats.total}
                        </StatNumber>
                      </VStack>
                      <Icon as={FiDollarSign} boxSize={6} color="blue.500" bg="blue.100" p={2} borderRadius="md" />
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2}>
                        <StatLabel color="gray.600" fontSize="sm">Total Invested</StatLabel>
                        <HStack spacing={1}>
                          <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
                            {formatMatic(stats.totalAmount)}
                          </StatNumber>
                          <Text fontSize="lg" color="purple.500" fontWeight="bold">MATIC</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          Across all projects
                        </Text>
                      </VStack>
                      <Icon as={FiDollarSign} boxSize={6} color="purple.500" bg="purple.100" p={2} borderRadius="md" />
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2}>
                        <StatLabel color="gray.600" fontSize="sm">Confirmed</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold" color="green.600">
                          {stats.confirmed}
                        </StatNumber>
                        <Text fontSize="xs" color="gray.500">
                          On blockchain
                        </Text>
                      </VStack>
                      <Icon as={FiCheckCircle} boxSize={6} color="green.500" bg="green.100" p={2} borderRadius="md" />
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2}>
                        <StatLabel color="gray.600" fontSize="sm">Pending</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold" color="yellow.600">
                          {stats.pending}
                        </StatNumber>
                        <Text fontSize="xs" color="gray.500">
                          Awaiting confirmation
                        </Text>
                      </VStack>
                      <Icon as={FiClock} boxSize={6} color="yellow.500" bg="yellow.100" p={2} borderRadius="md" />
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                      Search
                    </Text>
                    <Input
                      placeholder="Search by project or transaction..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="md"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                      Status
                    </Text>
                    <Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      size="md"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="failed">Failed</option>
                    </Select>
                  </Box>

                  <Flex align="flex-end">
                    <Button 
                      leftIcon={<FiDownload />}
                      onClick={handleExportCSV}
                      isDisabled={filteredContributions.length === 0}
                      colorScheme="gray"
                      variant="outline"
                      w="full"
                    >
                      Export CSV
                    </Button>
                  </Flex>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Contributions List */}
            {loading ? (
              <VStack spacing={4} py={20}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text color="gray.600">Loading contributions...</Text>
              </VStack>
            ) : filteredContributions.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {filteredContributions.map((contribution) => (
                  <Card 
                    key={contribution._id} 
                    bg={cardBg} 
                    borderWidth="1px" 
                    borderColor={borderColor}
                    _hover={{ shadow: 'md', borderColor: 'blue.300' }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => router.push(`/projects/${contribution.project._id}`)}
                  >
                    <CardBody>
                      <Flex justify="space-between" align="start" direction={{ base: 'column', md: 'row' }} gap={4}>
                        <HStack spacing={4} flex={1}>
                          <Icon
                            as={FiDollarSign}
                            boxSize={10}
                            color="purple.500"
                            bg="purple.100"
                            p={2}
                            borderRadius="md"
                          />
                          <VStack align="start" spacing={2} flex={1}>
                            <Text fontWeight="bold" fontSize="md" color="gray.700">
                              {contribution.project?.title || 'Unknown Project'}
                            </Text>
                            <HStack spacing={2}>
                              <Text fontWeight="bold" fontSize="xl" color="purple.600">
                                {formatMatic(contribution.amountMatic || contribution.amount)}
                              </Text>
                              <Text fontSize="md" color="purple.500" fontWeight="bold">MATIC</Text>
                            </HStack>
                            <HStack spacing={4} fontSize="sm" color="gray.600" flexWrap="wrap">
                              <HStack>
                                <Icon as={FiCalendar} />
                                <Text>
                                  {formatDate(contribution)}
                                </Text>
                              </HStack>
                              {contribution.transactionHash && (
                                <Link
                                  href={`https://polygonscan.com/tx/${contribution.transactionHash}`}
                                  isExternal
                                  onClick={(e) => e.stopPropagation()}
                                  color="blue.600"
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  _hover={{ textDecoration: 'underline' }}
                                >
                                  <Code fontSize="xs" colorScheme="blue">
                                    {contribution.transactionHash.slice(0, 10)}...
                                  </Code>
                                  <Icon as={FiExternalLink} boxSize={3} />
                                </Link>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack align={{ base: 'start', md: 'end' }} spacing={2}>
                          <Badge
                            colorScheme={getStatusColor(contribution.status)}
                            px={3}
                            py={2}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            fontSize="sm"
                          >
                            <Icon as={getStatusIcon(contribution.status)} />
                            {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                          </Badge>
                          {contribution.project?.category && (
                            <Badge colorScheme="gray" fontSize="xs">
                              {contribution.project.category.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </VStack>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Flex justify="center" align="center" gap={2} pt={4}>
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      isDisabled={currentPage === 1}
                      leftIcon={<FiArrowLeft />}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm" color="gray.600" px={4}>
                      Page {currentPage} of {totalPages}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      isDisabled={currentPage === totalPages}
                      rightIcon={<Icon as={FiArrowLeft} transform="rotate(180deg)" />}
                    >
                      Next
                    </Button>
                  </Flex>
                )}
              </VStack>
            ) : (
              <VStack spacing={4} py={20}>
                <Icon as={FiDollarSign} boxSize={12} color="gray.400" />
                <Text fontSize="lg" color="gray.600" fontWeight="medium">
                  {searchTerm || statusFilter !== 'all' ? 'No matching contributions' : 'No investments yet'}
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Start investing in projects to see your history here'}
                </Text>
                {(searchTerm || statusFilter !== 'all') ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    colorScheme="blue"
                    onClick={() => router.push('/projects/active')}
                  >
                    Browse Projects
                  </Button>
                )}
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    </RouteGuard>
  );
}