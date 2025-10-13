import React, { useState } from "react";
import { FiCopy, FiMail, FiShare2 } from "react-icons/fi";

// components/dashboard/farmer/ShareProjectModal.tsx
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
} from '@chakra-ui/react';

interface Project {
  id: string;
  name: string;
  progress: number;
  funding: string;
  fundingGoal: string;
  investors: number;
  phase: string;
  roi: string;
  status: string;
  description: string;
  expectedHarvest: string;
  location: string;
  images?: string[];
}

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

// ✅ REMOVED async keyword - React components cannot be async
export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  // Generate share URL (adjust based on your routing structure)
  const shareUrl = `${window.location.origin}/projects/${project.id}`;
  
  // Generate share text
  const shareText = `Check out this farming project: ${project.name}\n\n${project.description}\n\nLocation: ${project.location}\nFunding: ${project.funding} / ${project.fundingGoal}\nExpected Harvest: ${project.expectedHarvest}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Project link has been copied to clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link. Please copy manually.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Investment Opportunity: ${project.name}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this agricultural investment opportunity:\n\n` +
      `Project: ${project.name}\n` +
      `Description: ${project.description}\n\n` +
      `📍 Location: ${project.location}\n` +
      `💰 Funding: ${project.funding} of ${project.fundingGoal}\n` +
      `📊 Progress: ${project.progress}% funded\n` +
      `🌾 Expected Harvest: ${project.expectedHarvest}\n` +
      `👥 Investors: ${project.investors}\n\n` +
      `Learn more and invest here: ${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🌾 *${project.name}*\n\n` +
      `${project.description}\n\n` +
      `📍 ${project.location}\n` +
      `💰 ${project.funding} / ${project.fundingGoal} (${project.progress}% funded)\n` +
      `🌱 ${project.expectedHarvest}\n\n` +
      `Invest now: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `🌾 Exciting agricultural project: ${project.name}\n\n` +
      `📍 ${project.location}\n` +
      `💰 ${project.progress}% funded\n` +
      `🌱 Expected harvest: ${project.expectedHarvest}\n\n` +
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
      `🌾 ${project.name}\n\n${project.description}\n\n` +
      `📍 ${project.location} | 💰 ${project.progress}% funded`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.name,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared Successfully",
          status: "success",
          duration: 2000,
        });
      } catch (error) {
        // User cancelled share
        console.log('Share cancelled');
      }
    }
  };

  // ✅ FIXED: Check if navigator.share exists (not await it)
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={FiShare2} />
              <Text>Share Project</Text>
            </HStack>
            <Text fontSize="sm" fontWeight="normal" color="gray.600">
              Help this project reach more investors
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Project Preview Card */}
            <Box 
              p={4} 
              bg="gradient-to-r"
              bgGradient="linear(to-r, green.50, blue.50)"
              borderRadius="lg"
              border="1px"
              borderColor="green.200"
            >
              <VStack spacing={3} align="start">
                <HStack justify="space-between" w="full">
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {project.name}
                  </Text>
                  <Badge colorScheme="green" fontSize="xs">
                    {project.status}
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" color="gray.700" noOfLines={2}>
                  {project.description}
                </Text>
                
                <SimpleGrid columns={2} spacing={3} w="full" fontSize="xs">
                  <HStack>
                    <Text color="gray.600">📍</Text>
                    <Text color="gray.700">{project.location}</Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600">💰</Text>
                    <Text color="gray.700">{project.progress}% funded</Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600">🌾</Text>
                    <Text color="gray.700">{project.expectedHarvest}</Text>
                  </HStack>
                  <HStack>
                    <Text color="gray.600">👥</Text>
                    <Text color="gray.700">{project.investors} investors</Text>
                  </HStack>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Copy Link Section */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Project Link</FormLabel>
              <InputGroup size="md">
                <Input 
                  value={shareUrl} 
                  isReadOnly 
                  bg="gray.50"
                  pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                  <Button 
                    h="1.75rem" 
                    size="sm" 
                    onClick={handleCopyLink}
                    colorScheme={copied ? "green" : "blue"}
                    leftIcon={<FiCopy />}
                  >
                    {copied ? "✓" : "Copy"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Divider />

            {/* Social Share Buttons */}
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Share on Social Media
              </Text>
              
              <SimpleGrid columns={2} spacing={3}>
                <Button
                  leftIcon={<Icon as={FaWhatsapp} />}
                  colorScheme="whatsapp"
                  variant="outline"
                  onClick={handleWhatsAppShare}
                  size="sm"
                >
                  WhatsApp
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaTwitter} />}
                  colorScheme="twitter"
                  variant="outline"
                  onClick={handleTwitterShare}
                  size="sm"
                >
                  Twitter
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaFacebook} />}
                  colorScheme="facebook"
                  variant="outline"
                  onClick={handleFacebookShare}
                  size="sm"
                >
                  Facebook
                </Button>
                
                <Button
                  leftIcon={<Icon as={FaLinkedin} />}
                  colorScheme="linkedin"
                  variant="outline"
                  onClick={handleLinkedInShare}
                  size="sm"
                >
                  LinkedIn
                </Button>

                <Button
                  leftIcon={<Icon as={FaTelegram} />}
                  colorScheme="telegram"
                  variant="outline"
                  onClick={handleTelegramShare}
                  size="sm"
                >
                  Telegram
                </Button>
                
                <Button
                  leftIcon={<FiMail />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={handleEmailShare}
                  size="sm"
                >
                  Email
                </Button>
              </SimpleGrid>

              {/* Native Share API (Mobile) - ✅ FIXED */}
              {hasNativeShare && (
                <>
                  <Divider />
                  <Button
                    leftIcon={<FiShare2 />}
                    colorScheme="brand"
                    onClick={handleNativeShare}
                    size="sm"
                  >
                    More Share Options
                  </Button>
                </>
              )}
            </VStack>

            {/* Tips */}
            <Box p={3} bg="blue.50" borderRadius="md" fontSize="xs">
              <Text color="blue.800" fontWeight="medium" mb={1}>
                💡 Sharing Tips
              </Text>
              <Text color="blue.700">
                • Share with potential investors in your network
                <br />
                • Post on farming and investment communities
                <br />
                • Tag relevant organizations and influencers
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};