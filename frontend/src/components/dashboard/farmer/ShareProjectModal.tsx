import React, { useState } from "react";
import { FiCheckCircle, FiCopy, FiMail, FiShare2 } from "react-icons/fi";
import { Project as ApiProject } from "../../../lib/projectApi";

import { 
  FaWhatsapp, 
  FaTwitter, 
  FaFacebook, 
  FaLinkedin,
  FaTelegram 
} from 'react-icons/fa';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Divider,
  SimpleGrid,
  Icon,
  Badge,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ApiProject | null;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const shareUrl = `${window.location.origin}/projects/${project._id}`;
  const progress = project.fundingGoal > 0 
    ? (project.currentFunding / project.fundingGoal) * 100 
    : 0;
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const shareText = `Check out this farming project: ${project.title}\n\n${project.description}\n\nLocation: ${project.location}\nFunding: ${formatCurrency(project.currentFunding)} / ${formatCurrency(project.fundingGoal)}\nTimeline: ${project.timeline}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Project link copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Investment Opportunity: ${project.title}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this agricultural investment opportunity:\n\n` +
      `Project: ${project.title}\n` +
      `Description: ${project.description}\n\n` +
      `📍 Location: ${project.location}\n` +
      `💰 Funding: ${formatCurrency(project.currentFunding)} of ${formatCurrency(project.fundingGoal)}\n` +
      `📊 Progress: ${Math.round(progress)}% funded\n` +
      `🌾 Timeline: ${project.timeline}\n` +
      `👥 Contributors: ${project.contributorsCount}\n\n` +
      `Learn more and invest: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🌾 *${project.title}*\n\n` +
      `${project.description}\n\n` +
      `📍 ${project.location}\n` +
      `💰 ${formatCurrency(project.currentFunding)} / ${formatCurrency(project.fundingGoal)} (${Math.round(progress)}%)\n` +
      `🌱 ${project.timeline}\n\n` +
      `Invest now: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `🌾 Exciting agricultural project: ${project.title}\n\n` +
      `📍 ${project.location}\n` +
      `💰 ${Math.round(progress)}% funded\n` +
      `🌱 ${project.timeline}\n\n` +
      `#Agriculture #Farming #Investment #Sustainability`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=600'
    );
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(
      `🌾 ${project.title}\n\n${project.description}\n\n` +
      `📍 ${project.location} | 💰 ${Math.round(progress)}% funded`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared Successfully",
          status: "success",
          duration: 2000,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader borderBottom="1px" borderColor="gray.200">
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={FiShare2} color="green.500" boxSize={5} />
              <Text>Share Project</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="normal" color="gray.600">
              Help attract investors to this project
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Project Preview Card */}
            <Box 
              p={5} 
              bgGradient="linear(to-br, green.50, blue.50)"
              borderRadius="xl"
              border="2px"
              borderColor="green.200"
              shadow="sm"
            >
              <VStack spacing={4} align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="lg" fontWeight="bold" color="gray.800" noOfLines={1}>
                    {project.title}
                  </Text>
                  <Badge colorScheme="green" fontSize="xs" px={3} py={1}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" color="gray.700" noOfLines={3}>
                  {project.description}
                </Text>
                
                <Divider borderColor="green.200" />
                
                <SimpleGrid columns={2} spacing={4} w="full" fontSize="sm">
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="xs">Location</Text>
                    <HStack>
                      <Text>📍</Text>
                      <Text fontWeight="medium">{project.location}</Text>
                    </HStack>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="xs">Progress</Text>
                    <HStack>
                      <Text>💰</Text>
                      <Text fontWeight="medium" color="green.600">
                        {Math.round(progress)}% funded
                      </Text>
                    </HStack>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="xs">Timeline</Text>
                    <HStack>
                      <Text>🌾</Text>
                      <Text fontWeight="medium">{project.timeline}</Text>
                    </HStack>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="xs">Backers</Text>
                    <HStack>
                      <Text>👥</Text>
                      <Text fontWeight="medium">{project.contributorsCount}</Text>
                    </HStack>
                  </VStack>
                </SimpleGrid>
                
                <Box w="full" pt={2}>
                  <HStack justify="space-between" fontSize="xs" color="gray.600" mb={1}>
                    <Text>{formatCurrency(project.currentFunding)}</Text>
                    <Text>{formatCurrency(project.fundingGoal)}</Text>
                  </HStack>
                  <Box w="full" h="6px" bg="white" borderRadius="full" overflow="hidden">
                    <Box 
                      h="full" 
                      w={`${Math.min(progress, 100)}%`}
                      bg="green.400"
                      transition="width 0.3s"
                    />
                  </Box>
                </Box>
              </VStack>
            </Box>

            {/* Copy Link Section */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Project Link
              </FormLabel>
              <InputGroup size="md">
                <Input 
                  value={shareUrl} 
                  isReadOnly 
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.300"
                  _focus={{ borderColor: 'green.400', bg: 'white' }}
                  pr="5rem"
                  fontSize="sm"
                />
                <InputRightElement width="5rem" pr={1}>
                  <Button 
                    size="sm"
                    onClick={handleCopyLink}
                    colorScheme={copied ? "green" : "blue"}
                    leftIcon={copied ? <FiCheckCircle /> : <FiCopy />}
                    fontSize="xs"
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Divider />

            {/* Social Share Buttons */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Share on Social Media
              </Text>
              
              <SimpleGrid columns={2} spacing={3}>
                <Button
                  leftIcon={<Icon as={FaWhatsapp} />}
                  colorScheme="whatsapp"
                  variant="outline"
                  onClick={handleWhatsAppShare}
                  size="md"
                  _hover={{ bg: 'whatsapp.50' }}
                >
                  WhatsApp
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaTwitter} />}
                  colorScheme="twitter"
                  variant="outline"
                  onClick={handleTwitterShare}
                  size="md"
                  _hover={{ bg: 'twitter.50' }}
                >
                  Twitter
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaFacebook} />}
                  colorScheme="facebook"
                  variant="outline"
                  onClick={handleFacebookShare}
                  size="md"
                  _hover={{ bg: 'facebook.50' }}
                >
                  Facebook
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaLinkedin} />}
                  colorScheme="linkedin"
                  variant="outline"
                  onClick={handleLinkedInShare}
                  size="md"
                  _hover={{ bg: 'linkedin.50' }}
                >
                  LinkedIn
                </Button>

                <Button
                  leftIcon={<Icon as={FaTelegram} />}
                  colorScheme="telegram"
                  variant="outline"
                  onClick={handleTelegramShare}
                  size="md"
                  _hover={{ bg: 'telegram.50' }}
                >
                  Telegram
                </Button>
                
                <Button
                  leftIcon={<FiMail />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={handleEmailShare}
                  size="md"
                  _hover={{ bg: 'purple.50' }}
                >
                  Email
                </Button>
              </SimpleGrid>

              {hasNativeShare && (
                <Button
                  leftIcon={<FiShare2 />}
                  colorScheme="green"
                  onClick={handleNativeShare}
                  size="md"
                  variant="solid"
                >
                  More Share Options
                </Button>
              )}
            </VStack>

            {/* Tips */}
            <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
              <HStack spacing={2} mb={2}>
                <Text fontSize="lg">💡</Text>
                <Text color="blue.800" fontWeight="semibold" fontSize="sm">
                  Sharing Tips
                </Text>
              </HStack>
              <VStack align="start" spacing={1} fontSize="xs" color="blue.700">
                <Text>• Share with potential investors in your network</Text>
                <Text>• Post on farming and investment communities</Text>
                <Text>• Tag relevant organizations for more visibility</Text>
                <Text>• Share progress updates to keep backers engaged</Text>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};