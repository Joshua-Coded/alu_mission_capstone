import FarmerActivitiesSection from "./FarmerActivitiesSection";
import FarmerProjectsSection from "@/components/dashboard/farmer/FarmerProjectsSection";
import FarmerQuickActions from "./FarmerQuickActions";
import FarmerStatsGrid from "./FarmerStatsGrid";
import ProfileSettings from "../../common/ProfileSettings";
import React from "react";

import {
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Box,
  HStack,
  Icon,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiSend,
  FiPackage,
} from 'react-icons/fi';

// Main Dashboard Tab
const DashboardTab = () => (
  <VStack spacing={6} align="stretch">
    <FarmerStatsGrid />
    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
      <Box gridColumn={{ lg: 'span 2' }}>
        <FarmerProjectsSection />
      </Box>
      <Box>
        <FarmerActivitiesSection />
      </Box>
    </SimpleGrid>
    <FarmerQuickActions />
  </VStack>
);

// Projects Tab
const ProjectsTab = () => (
  <VStack spacing={4} align="stretch">
    <FarmerProjectsSection />
  </VStack>
);

// Investments Tab
const InvestmentsTab = () => (
  <VStack spacing={4} align="stretch">
    <HStack justify="space-between" align="center">
      <Heading size="lg">Investment History</Heading>
    </HStack>
    
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
      <Stat>
        <StatLabel>Total Investments Received</StatLabel>
        <StatNumber>$45,250</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          12.5% from last month
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>Average Investment</StatLabel>
        <StatNumber>$1,967</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          8.2% from last month
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>Returns Paid</StatLabel>
        <StatNumber>$8,394</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          5.3% from last month
        </StatHelpText>
      </Stat>
    </SimpleGrid>

    <Card>
      <CardBody>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Investor</Th>
              <Th>Amount</Th>
              <Th>Project</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Dec 15, 2024</Td>
              <Td>John Smith</Td>
              <Td>$2,500</Td>
              <Td>Organic Tomatoes 2024</Td>
              <Td><Badge colorScheme="green">Active</Badge></Td>
            </Tr>
            <Tr>
              <Td>Dec 10, 2024</Td>
              <Td>Sarah Johnson</Td>
              <Td>$1,800</Td>
              <Td>Sustainable Corn</Td>
              <Td><Badge colorScheme="green">Active</Badge></Td>
            </Tr>
            <Tr>
              <Td>Nov 28, 2024</Td>
              <Td>Mike Wilson</Td>
              <Td>$3,200</Td>
              <Td>Vertical Lettuce Farm</Td>
              <Td><Badge colorScheme="blue">Completed</Badge></Td>
            </Tr>
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  </VStack>
);

// Investors Tab
const InvestorsTab = () => (
  <VStack spacing={4} align="stretch">
    <HStack justify="space-between">
      <Heading size="lg">My Investors</Heading>
      <Text color="gray.600" fontSize="sm">23 Active Investors</Text>
    </HStack>

    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {[
        { name: 'John Smith', amount: '$2,500', projects: 2, returns: '22%' },
        { name: 'Sarah Johnson', amount: '$1,800', projects: 1, returns: '18%' },
        { name: 'Mike Wilson', amount: '$3,200', projects: 3, returns: '25%' },
        { name: 'Emily Davis', amount: '$1,200', projects: 1, returns: '20%' },
        { name: 'David Brown', amount: '$2,800', projects: 2, returns: '19%' },
        { name: 'Lisa Garcia', amount: '$1,500', projects: 1, returns: '24%' },
      ].map((investor, index) => (
        <Card key={index}>
          <CardBody py={4}>
            <VStack spacing={3}>
              <Avatar name={investor.name} size="md" />
              <VStack spacing={0.5}>
                <Text fontWeight="bold" fontSize="sm">{investor.name}</Text>
                <Text fontSize="xs" color="gray.600">
                  {investor.projects} projects
                </Text>
              </VStack>
              <HStack spacing={4} w="full" justify="center">
                <VStack spacing={0}>
                  <Text fontSize="md" fontWeight="bold" color="green.500">
                    {investor.amount}
                  </Text>
                  <Text fontSize="xs" color="gray.500">Invested</Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="md" fontWeight="bold" color="purple.500">
                    {investor.returns}
                  </Text>
                  <Text fontSize="xs" color="gray.500">Returns</Text>
                </VStack>
              </HStack>
              <Button size="xs" variant="outline" w="full">
                View Details
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  </VStack>
);

// Analytics Tab
const AnalyticsTab = () => (
  <VStack spacing={4} align="stretch">
    <Heading size="lg">Analytics & Performance</Heading>
    
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
      <Card>
        <CardBody>
          <VStack spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold" fontSize="sm">Revenue Trends</Text>
              <Icon as={FiTrendingUp} color="green.500" />
            </HStack>
            <Box w="full" h="180px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
              <Text color="gray.500" fontSize="sm">Chart visualization coming soon</Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <VStack spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold" fontSize="sm">ROI Analysis</Text>
              <Icon as={FiDollarSign} color="purple.500" />
            </HStack>
            <Box w="full" h="180px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
              <Text color="gray.500" fontSize="sm">ROI chart coming soon</Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  </VStack>
);

// Farm Schedule Tab
const ScheduleTab = () => (
  <VStack spacing={4} align="stretch">
    <HStack justify="space-between">
      <Heading size="lg">Farm Schedule</Heading>
      <Button leftIcon={<FiCalendar />} colorScheme="brand" size="sm">
        Add Event
      </Button>
    </HStack>

    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
      <Card>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm">Upcoming Tasks</Text>
            {[
              { task: 'Tomato Harvesting', date: 'Dec 20, 2024', priority: 'High' },
              { task: 'Corn Planting', date: 'Jan 5, 2025', priority: 'Medium' },
              { task: 'Irrigation Check', date: 'Dec 18, 2024', priority: 'Low' },
            ].map((item, index) => (
              <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                <VStack align="start" spacing={0.5}>
                  <Text fontWeight="medium" fontSize="sm">{item.task}</Text>
                  <Text fontSize="xs" color="gray.600">{item.date}</Text>
                </VStack>
                <Badge colorScheme={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'green'} fontSize="xs">
                  {item.priority}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Text fontWeight="bold" mb={3} fontSize="sm">Calendar View</Text>
          <Box w="full" h="240px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500" fontSize="sm">Calendar integration coming soon</Text>
          </Box>
        </CardBody>
      </Card>
    </SimpleGrid>
  </VStack>
);

// Farm Location Tab
const LocationTab = () => (
  <VStack spacing={4} align="stretch">
    <Heading size="lg">Farm Locations</Heading>
    
    <Card>
      <CardBody>
        <VStack spacing={3}>
          <HStack justify="space-between" w="full">
            <Text fontWeight="bold" fontSize="sm">Main Farm - Kigali Province</Text>
            <Badge colorScheme="green">Active</Badge>
          </HStack>
          <Box w="full" h="350px" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={2}>
              <Icon as={FiMapPin} boxSize={8} color="gray.400" />
              <Text color="gray.500" fontSize="sm">Interactive map coming soon</Text>
            </VStack>
          </Box>
          <SimpleGrid columns={3} spacing={4} w="full">
            <Stat size="sm">
              <StatLabel fontSize="xs">Total Area</StatLabel>
              <StatNumber fontSize="lg">25 acres</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Cultivated</StatLabel>
              <StatNumber fontSize="lg">22 acres</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Efficiency</StatLabel>
              <StatNumber fontSize="lg">88%</StatNumber>
            </Stat>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  </VStack>
);

// Crops & Seeds Tab
const CropsTab = () => (
  <VStack spacing={4} align="stretch">
    <HStack justify="space-between">
      <Heading size="lg">Crops & Seeds</Heading>
      <Button leftIcon={<FiSend />} colorScheme="brand" size="sm">
        Add Crop
      </Button>
    </HStack>

    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {[
        { name: 'Tomatoes', variety: 'Organic Roma', planted: '50 plants', status: 'Growing' },
        { name: 'Corn', variety: 'Sweet Corn', planted: '200 seeds', status: 'Planted' },
        { name: 'Lettuce', variety: 'Butterhead', planted: '100 plants', status: 'Harvesting' },
      ].map((crop, index) => (
        <Card key={index}>
          <CardBody py={4}>
            <VStack spacing={2}>
              <Icon as={FiSend} boxSize={6} color="green.500" />
              <VStack spacing={0.5}>
                <Text fontWeight="bold" fontSize="sm">{crop.name}</Text>
                <Text fontSize="xs" color="gray.600">{crop.variety}</Text>
                <Text fontSize="xs">{crop.planted}</Text>
              </VStack>
              <Badge colorScheme={crop.status === 'Growing' ? 'green' : crop.status === 'Planted' ? 'blue' : 'orange'} fontSize="xs">
                {crop.status}
              </Badge>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  </VStack>
);

// Inventory Tab
const InventoryTab = () => (
  <VStack spacing={4} align="stretch">
    <HStack justify="space-between">
      <Heading size="lg">Farm Inventory</Heading>
      <Button leftIcon={<FiPackage />} colorScheme="brand" size="sm">
        Add Item
      </Button>
    </HStack>

    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
      <Card>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm">Equipment</Text>
            {[
              { item: 'Tractor', condition: 'Good', lastService: 'Nov 2024' },
              { item: 'Irrigation System', condition: 'Excellent', lastService: 'Oct 2024' },
              { item: 'Harvester', condition: 'Fair', lastService: 'Sep 2024' },
            ].map((equipment, index) => (
              <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                <VStack align="start" spacing={0.5}>
                  <Text fontWeight="medium" fontSize="sm">{equipment.item}</Text>
                  <Text fontSize="xs" color="gray.600">Last service: {equipment.lastService}</Text>
                </VStack>
                <Badge colorScheme={equipment.condition === 'Excellent' ? 'green' : equipment.condition === 'Good' ? 'blue' : 'yellow'} fontSize="xs">
                  {equipment.condition}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Text fontWeight="bold" fontSize="sm">Supplies</Text>
            {[
              { item: 'Fertilizer', quantity: '50 bags', status: 'In Stock' },
              { item: 'Seeds (Tomato)', quantity: '10 packets', status: 'Low Stock' },
              { item: 'Pesticide', quantity: '20 bottles', status: 'In Stock' },
            ].map((supply, index) => (
              <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                <VStack align="start" spacing={0.5}>
                  <Text fontWeight="medium" fontSize="sm">{supply.item}</Text>
                  <Text fontSize="xs" color="gray.600">{supply.quantity}</Text>
                </VStack>
                <Badge colorScheme={supply.status === 'In Stock' ? 'green' : 'red'} fontSize="xs">
                  {supply.status}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  </VStack>
);

// Profile Tab - Now uses ProfileSettings component with all tabs (Profile, Settings, Security)
const ProfileTab = ({ user }: { user: any }) => (
  <ProfileSettings
    userType="farmer"
    userData={{
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      profileImage: user?.profileImage || '',
      bio: user?.bio || '',
      verified: user?.verified || true,
      walletAddress: user?.walletAddress || '',
    }}
    onSave={async (data: any) => {
      console.log('Saving profile data:', data);
    }}
  />
);

// Export all components for use in your main dashboard
export {
  DashboardTab,
  ProjectsTab,
  InvestmentsTab,
  InvestorsTab,
  AnalyticsTab,
  ScheduleTab,
  LocationTab,
  CropsTab,
  InventoryTab,
  ProfileTab,
};