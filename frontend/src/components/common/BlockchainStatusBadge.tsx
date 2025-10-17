import React from "react";
import { Project } from "../../lib/projectApi";

interface BlockchainStatusBadgeProps {
  project: Project;
  className?: string;
}

export const BlockchainStatusBadge: React.FC<BlockchainStatusBadgeProps> = ({ 
  project, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    if (!project.blockchainStatus || project.blockchainStatus === 'not_created') {
      return { label: 'Not on Blockchain', color: 'bg-gray-100 text-gray-800' };
    }
    
    switch (project.blockchainStatus) {
      case 'pending':
        return { label: 'Creating on Blockchain...', color: 'bg-yellow-100 text-yellow-800' };
      case 'created':
        return { label: 'On Blockchain', color: 'bg-green-100 text-green-800' };
      case 'failed':
        return { label: 'Blockchain Failed', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const status = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} ${className}`}>
      {project.blockchainStatus === 'created' && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {status.label}
    </span>
  );
};