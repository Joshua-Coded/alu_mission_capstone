import React from "react";
import { Project } from "../../lib/projectApi";

interface BlockchainTransactionLinkProps {
  project: Project;
  className?: string;
}

export const BlockchainTransactionLink: React.FC<BlockchainTransactionLinkProps> = ({ 
  project, 
  className = '' 
}) => {
  if (!project.blockchainTxHash) {
    return null;
  }

  const etherscanUrl = `https://sepolia.etherscan.io/tx/${project.blockchainTxHash}`;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <a
        href={etherscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        View on Etherscan
      </a>
    </div>
  );
};