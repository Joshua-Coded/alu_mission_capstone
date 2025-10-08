// ============================================
// FILE: components/contributor/ContributeModal.tsx
// MetaMask integration for blockchain contributions
// ============================================
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
    FormControl,
    FormLabel,
    Input,
    Text,
    Alert,
    AlertIcon,
    useToast,
    HStack,
    Divider,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Box,
  } from '@chakra-ui/react';
  import { useState } from 'react';
  import { useAccount } from 'wagmi';
  
  interface ContributeModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    minimumContribution: number;
    fundingGoal: number;
    currentFunding: number;
    onContributeConfirm: (amount: number) => Promise<void>;
  }
  
  export default function ContributeModal({
    isOpen,
    onClose,
    projectName,
    minimumContribution,
    fundingGoal,
    currentFunding,
    onContributeConfirm,
  }: ContributeModalProps) {
    const toast = useToast();
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState(minimumContribution);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const remainingFunding = fundingGoal - currentFunding;
  
    const handleSubmit = async () => {
      if (!isConnected) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet to contribute',
          status: 'error',
          duration: 3000,
        });
        return;
      }
  
      if (amount < minimumContribution) {
        toast({
          title: 'Amount Too Low',
          description: `Minimum contribution is $${minimumContribution}`,
          status: 'warning',
          duration: 3000,
        });
        return;
      }
  
      if (amount > remainingFunding) {
        toast({
          title: 'Amount Too High',
          description: `Only $${remainingFunding} needed to complete funding`,
          status: 'warning',
          duration: 3000,
        });
        return;
      }
  
      setIsSubmitting(true);
      try {
        await onContributeConfirm(amount);
        toast({
          title: 'Contribution Successful!',
          description: 'Your contribution has been recorded on the blockchain',
          status: 'success',
          duration: 5000,
        });
        onClose();
      } catch (error) {
        toast({
          title: 'Transaction Failed',
          description: 'Please try again or check your wallet',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="green.600">Contribute to Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="semibold">{projectName}</Text>
                  <Text fontSize="xs">Blockchain-secured contribution via MockUSDC</Text>
                </Box>
              </Alert>
  
              {/* Wallet Info */}
              {isConnected && address && (
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontSize="xs" color="gray.600" mb={1}>Connected Wallet</Text>
                  <Text fontSize="sm" fontFamily="mono" fontWeight="medium">
                    {address.slice(0, 10)}...{address.slice(-8)}
                  </Text>
                </Box>
              )}
  
              {/* Funding Info */}
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.600">Funding Goal:</Text>
                  <Text fontWeight="bold">${fundingGoal.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.600">Current Funding:</Text>
                  <Text fontWeight="bold">${currentFunding.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.600">Remaining:</Text>
                  <Text fontWeight="bold" color="green.600">${remainingFunding.toLocaleString()}</Text>
                </HStack>
              </VStack>
  
              <Divider />
  
              {/* Contribution Amount */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Contribution Amount (MockUSDC)</FormLabel>
                <NumberInput
                  value={amount}
                  onChange={(_, valueAsNumber) => setAmount(valueAsNumber)}
                  min={minimumContribution}
                  max={remainingFunding}
                >
                  <NumberInputField placeholder={`Min: $${minimumContribution}`} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="xs" color="gray.500">
                    Minimum: ${minimumContribution}
                  </Text>
                  <HStack spacing={2}>
                    <Button size="xs" variant="outline" onClick={() => setAmount(minimumContribution)}>
                      Min
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => setAmount(Math.min(remainingFunding, 1000))}>
                      $1,000
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => setAmount(remainingFunding)}>
                      Max
                    </Button>
                  </HStack>
                </HStack>
              </FormControl>
  
              <Alert status="success">
                <AlertIcon />
                <Text fontSize="xs">
                  Your contribution will be secured on the blockchain. When the funding goal is reached, funds will be released to the farmer.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Processing..."
              isDisabled={!isConnected}
            >
              Contribute ${amount.toLocaleString()}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }