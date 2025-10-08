"use client";
import FarmerSidebar from "@/components/dashboard/farmer/FarmerSidebar";
import React, { Suspense, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import TopHeader from "@/components/dashboard/farmer/TopHeader";
import WalletConnectionGuard from "@/components/WalletConnectionGuard";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";

// Import all tab components from FarmerTabs
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <RouteGuard allowedRoles={['FARMER']}>
      <WalletConnectionGuard 
        title="Connect Wallet to Farm Dashboard"
        description="Connect your wallet to create projects, receive funding, and track your farming progress on the blockchain."
      >
        <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
          
          <TopHeader
            user={user}
            address={address}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          <Box 
            ml={sidebarCollapsed ? '70px' : '280px'}
            transition="margin-left 0.3s ease"
            p={8}
            pt="100px" // Adjust based on your TopHeader height
          >
            <Container maxW="full">
              <Suspense fallback={<Box>Loading...</Box>}>
                <DashboardContent />
              </Suspense>
            </Container>
          </Box>
        </Box>
      </WalletConnectionGuard>
    </RouteGuard>
  );
}