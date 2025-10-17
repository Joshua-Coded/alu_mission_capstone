"use client";
import FarmerSidebar from "@/components/dashboard/farmer/FarmerSidebar";
import React, { Suspense, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import TopHeader from "@/components/dashboard/farmer/TopHeader";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";
import WalletSync from "@/components/WalletSync";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";

import {
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
} from "@/components/dashboard/farmer/FarmerTabs";

import {
  Box,
  Container,
  useColorModeValue,
  Spinner,
  VStack,
  Text,
} from '@chakra-ui/react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const { user } = useAuth();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'projects':
        return <ProjectsTab />;
      case 'investments':
        return <InvestmentsTab />;
      case 'investors':
        return <InvestorsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'schedule':
        return <ScheduleTab />;
      case 'location':
        return <LocationTab />;
      case 'crops':
        return <CropsTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'profile':
        return <ProfileTab user={user} />;
      default:
        return <DashboardTab />;
    }
  };

  return renderTabContent();
}

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { address } = useAccount();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <RouteGuard allowedRoles={['FARMER']}>
      <WalletConnectionGuard 
        title="Connect Wallet to Farm Dashboard"
        description="Connect your wallet to create projects, receive funding, and track your farming progress on the blockchain."
      >
        <WalletSync />  
        
        <Box minH="100vh" bg={bgColor}>
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
          
          <TopHeader
            user={user}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          {/* Added width calculation to fill available space */}
          <Box 
            ml={sidebarCollapsed ? '70px' : '280px'}
            transition="margin-left 0.3s ease"
            pt="80px"
            pb={8}
            px={6}
            minH="100vh"
            w={`calc(100% - ${sidebarCollapsed ? '70px' : '280px'})`}
          >
            
            <Box w="full">
              <Suspense 
                fallback={
                  <VStack spacing={4} py={20}>
                    <Spinner size="xl" color="green.500" thickness="4px" />
                    <Text color="gray.600">Loading dashboard...</Text>
                  </VStack>
                }
              >
                <DashboardContent />
              </Suspense>
            </Box>
          </Box>
        </Box>
      </WalletConnectionGuard>
    </RouteGuard>
  );
}