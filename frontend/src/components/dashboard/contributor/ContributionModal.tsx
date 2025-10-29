"use client";
import contributionApi from "@/lib/contributionApi";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiDollarSign, FiExternalLink, FiInfo } from "react-icons/fi";
import { parseEther } from "viem";
import { useAccount, useChainId } from "wagmi";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  HStack,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Spinner,
  Link,
  Badge,
  Tooltip,
  Progress,
  Heading,
  Code,
} from '@chakra-ui/react';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSuccess?: () => void;
}

interface ProjectReadiness {
  ready: boolean;
  reason?: string;
  project?: any;
}

export default function ContributionModal({
  isOpen,
  onClose,
  project: initialProject,
  onSuccess,
}: ContributionModalProps) {
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [amountMatic, setAmountMatic] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [step, setStep] = useState<'checking' | 'input' | 'sending' | 'confirming' | 'recording' | 'success'>('checking');
  const [project, setProject] = useState(initialProject);
  const [contributionInfo, setContributionInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectReady, setProjectReady] = useState<boolean>(false);
  const [readinessCheck, setReadinessCheck] = useState<ProjectReadiness | null>(null);

  const POLYGON_MAINNET = {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  };

  const isPolygon = chainId === 137;
  const isSupported = chainId === 137;


useEffect(() => {
  const checkProjectAndFetchInfo = async () => {
    if (!initialProject?._id) return;
    
    try {
      setLoadingInfo(true);
      setError(null);
      setStep('checking');

      const readinessResult = await contributionApi.isProjectReadyForContributions(initialProject._id);
      
      if (!readinessResult.success) {
        throw new Error(readinessResult.error || 'Failed to check project status');
      }

      if (!readinessResult.data) {
        throw new Error('No project readiness data received');
      }

      setReadinessCheck(readinessResult.data);

      if (!readinessResult.data.ready) {
        setError(readinessResult.data.reason || 'Project not ready for contributions');
        setProjectReady(false);
        setLoadingInfo(false);
        return;
      }

      setProjectReady(true);
      
      if (readinessResult.data.project) {
        setProject(readinessResult.data.project);
      }

      const infoResult = await contributionApi.getProjectContributionInfo(initialProject._id);
      
      if (infoResult.success && infoResult.data) {
        setContributionInfo(infoResult.data);
        console.log('📊 Contribution Info:', infoResult.data);
        
        // ✅ NEW: Check if can contribute
        if (!(infoResult.data as any).canContribute) {
          setError((infoResult.data as any).blockingReason || 'Contributions not accepted');
          setProjectReady(false);
          toast({
            title: 'Cannot Contribute',
            description: (infoResult.data as any).blockingReason || 'This project is not accepting contributions',
            status: 'info',
            duration: 7000,
            isClosable: true,
          });
        } else {
          setStep('input');
        }
      } else {
        throw new Error(infoResult.error || 'Failed to load contribution details');
      }
    } catch (error: any) {
      console.error('Failed to fetch contribution info:', error);
      
      // ✅ IMPROVED: Better error messages
      let errorMessage = error.message || 'Failed to load contribution details';
      
      if (errorMessage.includes('fully funded') || errorMessage.includes('completed')) {
        errorMessage = '🎉 This project is fully funded! Goal reached and funds released to farmer.';
      }
      
      setError(errorMessage);
      setStep('input');
      
      toast({
        title: errorMessage.includes('🎉') ? 'Project Fully Funded!' : 'Error',
        description: errorMessage,
        status: errorMessage.includes('🎉') ? 'success' : 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  if (isOpen) {
    checkProjectAndFetchInfo();
    setAmountMatic('');
    setTxHash('');
    setStep('checking');
    setError(null);
    setProjectReady(false);
    setReadinessCheck(null);
  }
}, [isOpen, initialProject, toast]);

  const switchToPolygon = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_MAINNET.chainIdHex }],
      });
      
      toast({
        title: 'Network Switched',
        description: 'Successfully switched to Polygon Mainnet',
        status: 'success',
        duration: 3000,
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: POLYGON_MAINNET.chainIdHex,
              chainName: POLYGON_MAINNET.name,
              nativeCurrency: POLYGON_MAINNET.nativeCurrency,
              rpcUrls: [POLYGON_MAINNET.rpcUrl],
              blockExplorerUrls: [POLYGON_MAINNET.explorerUrl],
            }],
          });
          
          toast({
            title: 'Network Added',
            description: 'Polygon Mainnet added to MetaMask',
            status: 'success',
            duration: 3000,
          });
        } catch (addError) {
          console.error('Failed to add Polygon network:', addError);
          toast({
            title: 'Network Error',
            description: 'Failed to add Polygon network',
            status: 'error',
            duration: 5000,
          });
        }
      } else {
        console.error('Failed to switch network:', switchError);
        toast({
          title: 'Network Error',
          description: 'Failed to switch to Polygon network',
          status: 'error',
          duration: 5000,
        });
      }
    }
  };

  const handleFundProject = async () => {
    if (!amountMatic || parseFloat(amountMatic) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid MATIC amount',
        status: 'error',
        duration: 3000,
      });
      return;
    }
  
    if (parseFloat(amountMatic) < 0.1) {
      toast({
        title: 'Amount Too Small',
        description: 'Minimum contribution is 0.1 MATIC',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
  
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your MetaMask wallet',
        status: 'error',
        duration: 3000,
      });
      return;
    }
  
    if (!isSupported) {
      toast({
        title: 'Wrong Network',
        description: 'Please switch to Polygon Mainnet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      await switchToPolygon();
      return;
    }
  
    if (!projectReady || !contributionInfo) {
      toast({
        title: 'Project Not Ready',
        description: 'This project is not ready for contributions',
        status: 'error',
        duration: 5000,
      });
      return;
    }
  
    if (!contributionInfo.isActive) {
      toast({
        title: 'Project Inactive',
        description: 'This project is not active on the blockchain',
        status: 'error',
        duration: 5000,
      });
      return;
    }
    {!loadingInfo && error && !projectReady && (
      <>
        {error.includes('🎉') || error.includes('fully funded') || error.toLowerCase().includes('completed') || error.toLowerCase().includes('not active') ? (
          // ✅ CELEBRATION ALERT for fully funded projects
          <Alert status="success" borderRadius="md" variant="subtle">
            <AlertIcon as={FiCheckCircle} boxSize={8} />
            <Box flex="1">
              <AlertTitle fontSize="lg">Project Fully Funded! 🎉</AlertTitle>
              <AlertDescription fontSize="sm">
                <VStack align="start" spacing={2} mt={2}>
                  <Text>
                    This project has reached its funding goal and funds have been automatically 
                    released to the farmer's wallet.
                  </Text>
                  <Text fontWeight="bold" color="green.600">
                    Thank you to all contributors who made this project successful!
                  </Text>
                  {contributionInfo?.farmerWalletAddress && (
                    <HStack spacing={2} mt={2}>
                      <Text fontSize="xs">Farmer received funds at:</Text>
                      <Code fontSize="xs" colorScheme="green">
                        {contributionInfo.farmerWalletAddress.slice(0, 6)}...{contributionInfo.farmerWalletAddress.slice(-4)}
                      </Code>
                    </HStack>
                  )}
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          // Regular warning alert
          <Alert status="warning" borderRadius="md">
            <AlertIcon as={FiAlertCircle} />
            <Box flex="1">
              <AlertTitle>Project Not Ready</AlertTitle>
              <AlertDescription fontSize="sm">
                {error}
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </>
    )}
  
    if (contributionInfo.blockchainProjectId === null || contributionInfo.blockchainProjectId === undefined) {
      toast({
        title: 'Blockchain Error',
        description: 'Project not properly deployed to blockchain',
        status: 'error',
        duration: 5000,
      });
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      setStep('sending');
  
      const { contractAddress, blockchainProjectId } = contributionInfo;
  
      console.log('🚀 Starting transaction:', {
        from: address,
        to: contractAddress,
        blockchainProjectId,
        amount: amountMatic,
      });
  
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('MetaMask not installed');
      }
  
      // contribute(uint256) = 0xc1cbbca7
      const CONTRIBUTE_SELECTOR = '0xc1cbbca7';
      
      // Convert project ID to padded hex (64 characters)
      const projectIdHex = blockchainProjectId.toString(16).padStart(64, '0');
      
      // Build complete transaction data
      const txData = CONTRIBUTE_SELECTOR + projectIdHex;
      
      // Convert MATIC to Wei in hex
      const weiValue = parseEther(amountMatic);
      const hexValue = '0x' + weiValue.toString(16);
  
      console.log('📤 Transaction params:', {
        function: 'contribute(uint256)',
        selector: CONTRIBUTE_SELECTOR,
        projectId: blockchainProjectId,
        projectIdHex,
        fullData: txData,
        value: amountMatic,
        valueWei: weiValue.toString(),
        hexValue,
      });
  
      // Send transaction
      const transactionHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: contractAddress,
          value: hexValue,
          data: txData,
          gas: '0x493E0', // 300,000 in hex
        }],
      });
  
      console.log('✅ Transaction sent:', transactionHash);
      setTxHash(transactionHash);
      setStep('confirming');
  
      toast({
        title: 'Transaction Sent',
        description: 'Waiting for blockchain confirmation...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
  
      // Wait for confirmation (up to 2 minutes)
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 60;
  
      while (!confirmed && attempts < maxAttempts) {
        try {
          const receipt = await ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [transactionHash],
          });
  
          if (receipt) {
            console.log('📝 Receipt:', receipt);
            
            if (receipt.status === '0x1') {
              confirmed = true;
              console.log('✅ Transaction confirmed!');
              break;
            } else if (receipt.status === '0x0') {
              throw new Error('Transaction failed on blockchain. Check Polygonscan for details.');
            }
          }
  
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        } catch (error) {
          console.log(`Waiting for confirmation... (attempt ${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }
  
      if (!confirmed) {
        throw new Error('Transaction confirmation timeout. Check Polygonscan: https://polygonscan.com/tx/' + transactionHash);
      }
  
   // Record in backend
setStep('recording');

const contributionResult = await contributionApi.recordContributionAfterTransaction(
  project._id,
  parseFloat(amountMatic),
  transactionHash,
  address, // ✅ Send wallet address as 3rd parameter
  { anonymous: false } // metadata as 4th parameter
);

if (!contributionResult.success) {
  console.warn('⚠️ Backend recording failed, but blockchain transaction succeeded');
  console.error('Backend recording error:', contributionResult.error);
  
  toast({
    title: 'Warning',
    description: 'Transaction succeeded but backend recording failed. Your contribution is on the blockchain.',
    status: 'warning',
    duration: 5000,
  });
} else {
  console.log('✅ Backend recording successful:', contributionResult.data);
}
  
      setStep('success');
      
      toast({
        title: 'Success! 🎉',
        description: `You contributed ${amountMatic} MATIC!`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
  
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 3000);
  
    } catch (error: any) {
      console.error('❌ Contribution failed:', error);
      
      let errorMessage = error.message || 'Transaction failed';
      
      // Parse MetaMask errors
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error. Check your wallet balance.';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient MATIC balance for transaction + gas fees';
      }
      
      setError(errorMessage);
      setStep('input');
      
      toast({
        title: 'Transaction Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    setAmountMatic('');
    setTxHash('');
    setStep('checking');
    setError(null);
    setProjectReady(false);
    setReadinessCheck(null);
    onClose();
  };

  const currentFundingMatic = contributionInfo?.currentFunding || '0';
  const fundingGoalMatic = contributionInfo?.fundingGoal || '0';
  const fundingPercentage = fundingGoalMatic && parseFloat(fundingGoalMatic) > 0 
    ? ((parseFloat(currentFundingMatic) / parseFloat(fundingGoalMatic)) * 100).toFixed(1)
    : '0';
  const remainingMatic = (parseFloat(fundingGoalMatic) - parseFloat(currentFundingMatic)).toFixed(4);
  const isFullyFunded = contributionInfo?.isFullyFunded || false;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="xl"
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent maxW="600px">
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Heading size="md">Contribute with MATIC</Heading>
            <Text fontSize="sm" fontWeight="normal" color="gray.600">
              {project?.title || 'Loading...'}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody>
          <VStack spacing={5} align="stretch">
            {loadingInfo && (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" color="green.500" thickness="4px" mb={4} />
                <Text color="gray.600">Checking project status...</Text>
              </Box>
            )}

            {!loadingInfo && error && !projectReady && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon as={FiAlertCircle} />
                <Box flex="1">
                  <AlertTitle>Project Not Ready</AlertTitle>
                  <AlertDescription fontSize="sm">
                    {error}
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {step === 'success' && (
              <Alert status="success" borderRadius="md" variant="subtle">
                <AlertIcon as={FiCheckCircle} boxSize={8} />
                <Box flex="1">
                  <AlertTitle fontSize="lg">Contribution Successful! 🎉</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={2} mt={2}>
                      <Text>Your {amountMatic} MATIC has been sent to the smart contract.</Text>
                      <Text fontSize="sm">
                        Funds will automatically transfer to farmer when goal is reached.
                      </Text>
                      {txHash && (
                        <Link
                          href={`https://polygonscan.com/tx/${txHash}`}
                          isExternal
                          color="green.600"
                          fontSize="sm"
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          View on Polygonscan
                          <Icon as={FiExternalLink} />
                        </Link>
                      )}
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {!loadingInfo && projectReady && contributionInfo && step !== 'success' && (
              <>
                {!isConnected && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Please connect your MetaMask wallet to continue
                    </Text>
                  </Alert>
                )}

                {isConnected && !isPolygon && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={2} flex="1">
                      <AlertTitle fontSize="sm">Wrong Network</AlertTitle>
                      <AlertDescription fontSize="sm">
                        Please switch to Polygon Mainnet
                      </AlertDescription>
                      <Button size="sm" colorScheme="orange" onClick={switchToPolygon}>
                        Switch to Polygon
                      </Button>
                    </VStack>
                  </Alert>
                )}

                {isPolygon && (
                  <Alert status="success" borderRadius="md" variant="subtle">
                    <AlertIcon />
                    <VStack align="start" spacing={0} fontSize="sm">
                      <Text fontWeight="semibold">✅ Connected to Polygon Mainnet</Text>
                      <Text fontSize="xs" color="gray.600">Fast & cheap transactions (~$0.01)</Text>
                    </VStack>
                  </Alert>
                )}

                <Alert status="info" borderRadius="md" variant="left-accent">
                  <AlertIcon />
                  <VStack align="start" spacing={2} fontSize="sm" flex="1">
                    <Text fontWeight="semibold">How It Works:</Text>
                    <VStack align="start" spacing={1} pl={2} fontSize="xs">
                      <Text>1. Send MATIC to smart contract</Text>
                      <Text>2. Contract holds funds until goal reached</Text>
                      <Text>3. Auto-release to farmer wallet</Text>
                      <Text fontWeight="bold" color="blue.600">No manual withdrawal!</Text>
                    </VStack>
                  </VStack>
                </Alert>

                <Box p={4} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="semibold" color="green.700" fontSize="sm">
                        Funding Progress
                      </Text>
                      <Badge colorScheme={isFullyFunded ? "green" : "orange"}>
                        {fundingPercentage}% Funded
                      </Badge>
                    </HStack>
                    <Progress 
                      value={parseFloat(fundingPercentage)} 
                      colorScheme="green" 
                      size="sm" 
                      borderRadius="full" 
                      hasStripe
                      isAnimated
                    />
                    <HStack justify="space-between" fontSize="xs">
                      <Text><strong>{currentFundingMatic}</strong> MATIC raised</Text>
                      <Text>Goal: <strong>{fundingGoalMatic}</strong> MATIC</Text>
                    </HStack>
                    {!isFullyFunded && (
                      <Text fontSize="xs" color="green.700">
                        Remaining: <strong>{remainingMatic} MATIC</strong>
                      </Text>
                    )}
                  </VStack>
                </Box>

                <VStack spacing={3} align="stretch">
                  <Box p={3} bg="purple.50" borderRadius="md" borderWidth="1px" borderColor="purple.200">
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Text fontWeight="semibold" color="purple.700" fontSize="sm">Smart Contract</Text>
                        <Tooltip label="MATIC goes here first" fontSize="xs">
                          <span><Icon as={FiInfo} color="purple.500" boxSize={3} /></span>
                        </Tooltip>
                      </HStack>
                    </HStack>
                    <Code fontSize="xs" colorScheme="purple" p={2} borderRadius="md" wordBreak="break-all">
                      {contributionInfo?.contractAddress}
                    </Code>
                  </Box>

                  <Box p={3} bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Text fontWeight="semibold" color="green.700" fontSize="sm">Farmer's Wallet</Text>
                        <Tooltip label="Auto-release when goal reached" fontSize="xs">
                          <span><Icon as={FiInfo} color="green.500" boxSize={3} /></span>
                        </Tooltip>
                      </HStack>
                    </HStack>
                    <Code fontSize="xs" colorScheme="green" p={2} borderRadius="md" wordBreak="break-all">
                      {contributionInfo?.farmerWalletAddress}
                    </Code>
                  </Box>
                </VStack>

                <Divider />

                <FormControl isRequired isDisabled={loading || !isPolygon}>
                  <FormLabel fontSize="sm" fontWeight="semibold">Contribution Amount (MATIC)</FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1.0"
                    value={amountMatic}
                    onChange={(e) => setAmountMatic(e.target.value)}
                    size="lg"
                    disabled={loading || !isPolygon}
                    fontSize="lg"
                    fontWeight="medium"
                  />
                  <FormHelperText fontSize="xs">
                    Minimum: 0.1 MATIC
                  </FormHelperText>
                </FormControl>

                {loading && (
                  <VStack p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200" spacing={3}>
                    <Spinner color="blue.500" size="lg" thickness="3px" />
                    <VStack spacing={1}>
                      <Text fontWeight="semibold" color="blue.700" fontSize="sm">
                        {step === 'sending' && '📤 Sending to smart contract...'}
                        {step === 'confirming' && '⏳ Confirming on Polygon...'}
                        {step === 'recording' && '📝 Recording contribution...'}
                      </Text>
                      <Text fontSize="xs" color="gray.600">Please don't close this window</Text>
                      {txHash && (
                        <Link
                          href={`https://polygonscan.com/tx/${txHash}`}
                          isExternal
                          fontSize="xs"
                          color="blue.600"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mt={2}
                        >
                          View on Polygonscan <Icon as={FiExternalLink} />
                        </Link>
                      )}
                    </VStack>
                  </VStack>
                )}

                {!loading && (
                  <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Text fontWeight="semibold" fontSize="sm" mb={3}>Transaction Summary</Text>
                    <VStack spacing={2} fontSize="sm">
                      <HStack justify="space-between" w="full">
                        <Text color="gray.600">Amount:</Text>
                        <Text fontWeight="bold">{amountMatic || '0'} MATIC</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color="gray.600">Network:</Text>
                        <Badge colorScheme="purple">Polygon Mainnet</Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text color="gray.600">Gas Fee:</Text>
                        <Text fontWeight="medium" color="green.600">~$0.01</Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                {isConnected && address && (
                  <HStack justify="center" fontSize="xs" color="gray.500">
                    <Text>Connected:</Text>
                    <Code fontSize="xs" px={2} py={1}>
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </Code>
                  </HStack>
                )}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={loading} size="md">
            {step === 'success' ? 'Close' : 'Cancel'}
          </Button>
          
          {step !== 'success' && projectReady && (
            <Button
              colorScheme="green"
              leftIcon={<Icon as={FiDollarSign} />}
              onClick={handleFundProject}
              isLoading={loading}
              loadingText={
                step === 'sending' ? 'Sending...' :
                step === 'confirming' ? 'Confirming...' :
                step === 'recording' ? 'Recording...' : 'Processing...'
              }
              isDisabled={
                !isConnected || 
                !contributionInfo ||
                !amountMatic || 
                parseFloat(amountMatic) < 0.1 ||
                !isSupported ||
                isFullyFunded ||
                loadingInfo
              }
              size="md"
            >
              {isFullyFunded ? 'Fully Funded!' : 'Contribute MATIC'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}