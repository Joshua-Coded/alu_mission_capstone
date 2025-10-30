"use client";
import FarmerSidebar from "../dashboard/farmer/FarmerSidebar";
import React, { useState } from "react";
import TopHeader from "../dashboard/farmer/TopHeader";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: 'FARMER' | 'INVESTOR' | 'GOVERNMENT';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userRole = 'FARMER' 
}) => {
  const { user, logout } = useAuth();
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
        return (
          <FarmerSidebar 
            isCollapsed={sidebarCollapsed}
            user={user}
          />
        );
      case 'GOVERNMENT':
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
        px={{ base: 4, md: 6 }}
        w={`calc(100% - ${sidebarCollapsed ? '70px' : '280px'})`}
        minH="100vh"
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;