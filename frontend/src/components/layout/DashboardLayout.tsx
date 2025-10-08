"use client";
import FarmerSidebar from "../dashboard/farmer/FarmerSidebar";
import React, { useState } from "react";
import TopHeader from "../dashboard/farmer/TopHeader";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useAuth } from "@/contexts/AuthContext";

// components/layout/DashboardLayout.tsx

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: 'FARMER' | 'INVESTOR' | 'GOVERNMENT';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userRole = 'FARMER' 
}) => {
  const { user, logout } = useAuth();
  const { address } = useAccount();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // You can add different sidebars for different roles
  const renderSidebar = () => {
    switch (userRole) {
      case 'FARMER':
        return (
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
        );
      case 'INVESTOR':
        // You can create InvestorSidebar later
        return (
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
        );
      case 'GOVERNMENT':
        // You can create GovernmentSidebar later
        return (
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
        );
      default:
        return (
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
        );
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Top Header */}
      <TopHeader
        user={user}
        address={address}
        onLogout={logout}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Main Content */}
      <Box 
        ml={sidebarCollapsed ? '70px' : '280px'}
        transition="margin-left 0.3s ease"
        pt={4}
        pb={8}
        px={8}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;