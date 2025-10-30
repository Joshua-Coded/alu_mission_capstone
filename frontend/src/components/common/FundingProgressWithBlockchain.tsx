import React, { useCallback, useEffect, useState } from "react";
import { Project, projectApi } from "../../lib/projectApi";

interface FundingProgressWithBlockchainProps {
  project: Project;
  showBlockchainInfo?: boolean;
  className?: string;
}

export const FundingProgressWithBlockchain: React.FC<FundingProgressWithBlockchainProps> = ({ 
  project, 
  showBlockchainInfo = true,
  className = '' 
}) => {
  const [blockchainStatus, setBlockchainStatus] = useState<{
    blockchainFunding?: string;
    isFunded?: boolean;
    canComplete?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const progressPercentage = (project.currentFunding / project.fundingGoal) * 100;
  const isFullyFunded = project.currentFunding >= project.fundingGoal;

  const fetchBlockchainStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await projectApi.getBlockchainStatus(project._id);
      setBlockchainStatus(status);
    } catch (error) {
      console.error('Failed to fetch blockchain status:', error);
    } finally {
      setLoading(false);
    }
  }, [project._id]);
  
  useEffect(() => {
    if (showBlockchainInfo && project.blockchainStatus === 'created') {
      fetchBlockchainStatus();
    }
  }, [project._id, project.blockchainStatus, showBlockchainInfo, fetchBlockchainStatus]);
  

  const getFundingDifference = () => {
    if (!blockchainStatus?.blockchainFunding) return null;
    
    const blockchainFunding = parseFloat(blockchainStatus.blockchainFunding);
    const difference = blockchainFunding - project.currentFunding;
    
    if (Math.abs(difference) < 0.001) return null; // Negligible difference
    
    return {
      amount: difference,
      isPositive: difference > 0
    };
  };

  const fundingDifference = getFundingDifference();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Funding Progress
          </span>
          <span className="text-sm text-gray-600">
            {project.currentFunding.toLocaleString()} / {project.fundingGoal.toLocaleString()} ETH
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isFullyFunded ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {progressPercentage.toFixed(1)}% Funded
          </span>
          {isFullyFunded && (
            <span className="text-sm font-medium text-green-600">
              🎉 Fully Funded!
            </span>
          )}
        </div>
      </div>

      {/* Blockchain Information */}
      {showBlockchainInfo && project.blockchainStatus === 'created' && (
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Blockchain Verification</span>
            <button
              onClick={fetchBlockchainStatus}
              disabled={loading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {blockchainStatus && (
            <div className="space-y-2 text-sm">
              {/* Blockchain Funding */}
              {blockchainStatus.blockchainFunding && (
                <div className="flex justify-between">
                  <span className="text-gray-600">On Blockchain:</span>
                  <span className="font-medium">
                    {parseFloat(blockchainStatus.blockchainFunding).toLocaleString()} ETH
                  </span>
                </div>
              )}

              {/* Funding Difference */}
              {fundingDifference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sync Status:</span>
                  <span className={`font-medium ${fundingDifference.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                    {fundingDifference.isPositive ? '+' : ''}{fundingDifference.amount.toFixed(4)} ETH
                  </span>
                </div>
              )}

              {/* Blockchain Project ID */}
              {project.blockchainProjectId !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Blockchain ID:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    #{project.blockchainProjectId}
                  </span>
                </div>
              )}

              {/* Completion Status */}
              {blockchainStatus.isFunded && (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-green-700 text-sm">✅ Fully funded on blockchain</span>
                  {blockchainStatus.canComplete && (
                    <span className="text-xs text-green-600">Ready to complete</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Transaction Link */}
          {project.blockchainTxHash && (
            <div className="pt-2 border-t">
              <a
                href={`https://sepolia.etherscan.io/tx/${project.blockchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View transaction on Etherscan
              </a>
            </div>
          )}
        </div>
      )}

      {/* Blockchain Not Created Message */}
      {showBlockchainInfo && project.blockchainStatus === 'failed' && (
        <div className="p-2 bg-red-50 rounded border border-red-200">
          <p className="text-xs text-red-700">
            ⚠️ Failed to create on blockchain. Project exists locally only.
          </p>
        </div>
      )}
    </div>
  );
};