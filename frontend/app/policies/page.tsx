"use client";
import { FiCheckCircle, FiFileText, FiLock, FiShield } from "react-icons/fi";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge,
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react';

export default function PoliciesPage() {
  const bgGradient = useColorModeValue(
    'linear(to-br, green.50, emerald.50, green.100)',
    'linear(to-br, gray.900, gray.800, gray.900)'
  );
  const headerBg = useColorModeValue(
    'linear(to-r, green.600, emerald.700)',
    'linear(to-r, green.800, emerald.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('green.50', 'green.900');
  const borderColor = useColorModeValue('green.500', 'green.600');

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Header */}
      <Box bgGradient={headerBg} color="white" boxShadow="lg">
        <Container maxW="6xl" py={8}>
          <VStack spacing={2} align="start">
            <Heading size="2xl" fontWeight="bold">
              RootRise Legal & Privacy
            </Heading>
            <Text fontSize="lg" color="green.100">
              End User License Agreement, Copyright & Privacy Policy
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Navigation */}
      <Box
        bg={cardBg}
        boxShadow="md"
        position="sticky"
        top={0}
        zIndex={50}
        borderBottom="2px"
        borderColor={borderColor}
      >
        <Container maxW="6xl" py={4}>
          <Flex
            gap={6}
            justify="center"
            wrap="wrap"
            direction={{ base: 'column', md: 'row' }}
            align="center"
          >
            <Link
              href="#eula"
              color="green.700"
              fontWeight="semibold"
              _hover={{ color: 'green.900', textDecor: 'underline' }}
              transition="all 0.2s"
            >
              <HStack>
                <Icon as={FiFileText} />
                <Text>End User License Agreement</Text>
              </HStack>
            </Link>
            <Link
              href="#copyright"
              color="green.700"
              fontWeight="semibold"
              _hover={{ color: 'green.900', textDecor: 'underline' }}
              transition="all 0.2s"
            >
              <HStack>
                <Icon as={FiShield} />
                <Text>Copyright Notice</Text>
              </HStack>
            </Link>
            <Link
              href="#privacy"
              color="green.700"
              fontWeight="semibold"
              _hover={{ color: 'green.900', textDecor: 'underline' }}
              transition="all 0.2s"
            >
              <HStack>
                <Icon as={FiLock} />
                <Text>Privacy Policy</Text>
              </HStack>
            </Link>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="6xl" py={12}>
        {/* EULA Section */}
        <Box
          id="eula"
          mb={16}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          p={8}
          borderTop="4px"
          borderColor="green.500"
        >
          <HStack spacing={3} mb={6}>
            <Box w={2} h={8} bg="green.600" borderRadius="md" />
            <Heading size="xl" color="green.800">
              End User License Agreement (EULA)
            </Heading>
          </HStack>
          
          <Badge colorScheme="green" fontSize="sm" mb={8}>
            Effective Date: 20th of November 2025
          </Badge>

          <VStack spacing={6} align="stretch">
            <Text color="gray.700" lineHeight="tall">
              This End User License Agreement (&quot;Agreement&quot;) is a legal agreement between you
              (&quot;User&quot;) and <Text as="span" fontWeight="bold" color="green.700">RootRise</Text> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) for
              the use of the RootRise blockchain-based agricultural crowdfunding platform
              (&quot;Platform&quot;). By accessing or using the Platform, you agree to be bound by the
              terms of this Agreement.
            </Text>

            {/* Section 1 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                1. Grant of License
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                Subject to your compliance with this Agreement, we grant you a limited,
                non-exclusive, non-transferable, revocable license to access and use the
                Platform for your personal or business purposes in accordance with these terms.
              </Text>
            </Box>

            {/* Section 2 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                2. User Obligations
              </Heading>
              <Text color="gray.700" mb={3}>You agree to:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Provide accurate and complete information during registration
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Maintain the confidentiality of your account credentials
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Comply with all applicable laws and regulations
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Use the Platform only for lawful purposes
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Not engage in fraudulent, abusive, or harmful activities
                </ListItem>
              </List>
            </Box>

            {/* Section 3 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                3. Restrictions
              </Heading>
              <Text color="gray.700" mb={3}>You may not:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Copy, modify, or distribute the Platform&apos;s content or software
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Reverse engineer, decompile, or disassemble the Platform
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Use the Platform to transmit malware or harmful code
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Interfere with or disrupt the Platform&apos;s operation
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Attempt to gain unauthorized access to any part of the Platform
                </ListItem>
              </List>
            </Box>

            {/* Section 4 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                4. Intellectual Property
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                All content, trademarks, logos, and intellectual property on the Platform are
                owned by RootRise or its licensors. You are granted no rights to use such
                materials except as expressly permitted in this Agreement.
              </Text>
            </Box>

            {/* Section 5 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                5. Blockchain Transactions
              </Heading>
              <Text color="gray.700" mb={3}>
                The Platform utilizes blockchain technology for transactions. You acknowledge that:
              </Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Blockchain transactions are irreversible
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  You are responsible for the accuracy of transaction details
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Network fees may apply and are subject to change
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  We are not responsible for blockchain network delays or failures
                </ListItem>
              </List>
            </Box>

            {/* Section 6 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                6. Investment Risk Disclosure
              </Heading>
              <Text color="gray.700" mb={3}>
                Agricultural investments carry inherent risks. You acknowledge that:
              </Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Investments may result in partial or total loss
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Past performance does not guarantee future results
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  We do not provide financial, legal, or investment advice
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  You should conduct your own due diligence before investing
                </ListItem>
              </List>
            </Box>

            {/* Sections 7-12 */}
            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                7. Disclaimers
              </Heading>
              <Text color="gray.700" lineHeight="tall" fontWeight="semibold">
                THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                IMPLIED. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE OPERATION OF THE
                PLATFORM.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                8. Limitation of Liability
              </Heading>
              <Text color="gray.700" lineHeight="tall" fontWeight="semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF
                THE PLATFORM.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                9. Termination
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                We reserve the right to suspend or terminate your access to the Platform at any
                time for violation of this Agreement or for any other reason at our discretion.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                10. Governing Law
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                This Agreement shall be governed by and construed in accordance with the laws of
                Rwanda, without regard to its conflict of law provisions.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                11. Changes to Agreement
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                We reserve the right to modify this Agreement at any time. Changes will be
                effective upon posting to the Platform. Your continued use constitutes acceptance
                of the modified terms.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
              <Heading size="md" color="green.800" mb={3}>
                12. Contact Information
              </Heading>
              <VStack align="start" spacing={2}>
                <Text color="gray.700">For questions about this Agreement, please contact us at:</Text>
                <Text><Text as="span" fontWeight="bold" color="green.700">Email:</Text> j.alana@alustudent.com</Text>
                <Text><Text as="span" fontWeight="bold" color="green.700">Address:</Text> Kigali, Rwanda</Text>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Copyright Section */}
        <Box
          id="copyright"
          mb={16}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          p={8}
          borderTop="4px"
          borderColor="emerald.500"
        >
          <HStack spacing={3} mb={6}>
            <Box w={2} h={8} bg="emerald.600" borderRadius="md" />
            <Heading size="xl" color="emerald.800">
              Copyright Notice
            </Heading>
          </HStack>
          
          <Badge colorScheme="green" fontSize="sm" mb={8}>
            Effective Date: 20th of November 2025
          </Badge>

          <VStack spacing={6} align="stretch">
            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                1. Ownership
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                All content on the RootRise Platform, including but not limited to text, graphics,
                logos, images, videos, software, and data compilations, is the property of
                RootRise or its content suppliers and is protected by international copyright laws.
              </Text>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                2. Copyright Protection
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                © 2025 RootRise. All rights reserved. The RootRise name, logo, and all related
                names, logos, product and service names, designs, and slogans are trademarks of
                RootRise or its affiliates.
              </Text>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                3. Permitted Use
              </Heading>
              <Text color="gray.700" mb={3}>You may:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  View and use the Platform for personal or business purposes
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Print or download content for personal reference
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Share links to the Platform on social media
                </ListItem>
              </List>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                4. Prohibited Use
              </Heading>
              <Text color="gray.700" mb={3}>You may not:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Copy, reproduce, or distribute Platform content without permission
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Modify, adapt, or create derivative works
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Use content for commercial purposes without authorization
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Remove or alter copyright notices or watermarks
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Use automated systems to scrape or collect Platform data
                </ListItem>
              </List>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                5. User-Generated Content
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                By submitting content to the Platform, you grant RootRise a worldwide,
                non-exclusive, royalty-free license to use, reproduce, modify, and display such
                content in connection with the Platform&apos;s operation.
              </Text>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                6. Digital Millennium Copyright Act (DMCA)
              </Heading>
              <Text color="gray.700" mb={3}>
                If you believe that your copyrighted work has been infringed, please provide our
                designated agent with:
              </Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Identification of the copyrighted work
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Identification of the infringing material
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Your contact information
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  A statement of good faith belief
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  A statement of accuracy under penalty of perjury
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="emerald.500" />
                  Physical or electronic signature
                </ListItem>
              </List>
              <VStack align="start" spacing={2} mt={4}>
                <Text fontWeight="bold" color="emerald.700">DMCA Agent:</Text>
                <Text>Email: j.alana@alustudent.com</Text>
                <Text>Address: Kigali, Rwanda</Text>
              </VStack>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                7. Third-Party Content
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                The Platform may contain content provided by third parties. RootRise respects the
                intellectual property rights of others and expects users to do the same.
              </Text>
            </Box>

            <Box bg="emerald.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="emerald.500">
              <Heading size="md" color="emerald.800" mb={3}>
                8. Enforcement
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                RootRise actively monitors for copyright violations and will take appropriate
                action, including account termination and legal proceedings, against users who
                infringe copyrights.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Privacy Policy Section */}
        <Box
          id="privacy"
          mb={16}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          p={8}
          borderTop="4px"
          borderColor="green.600"
        >
          <HStack spacing={3} mb={6}>
            <Box w={2} h={8} bg="green.700" borderRadius="md" />
            <Heading size="xl" color="green.900">
              Privacy Policy
            </Heading>
          </HStack>
          
          <Badge colorScheme="green" fontSize="sm" mb={8}>
            Effective Date: 20th of November 2025
          </Badge>

          <VStack spacing={6} align="stretch">
            <Text color="gray.700" lineHeight="tall">
              RootRise (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our Platform.
            </Text>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                1. Information We Collect
              </Heading>
              <VStack align="start" spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="green.800" mb={2}>Personal Information:</Text>
                  <List spacing={2} ml={4}>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Name, email address, phone number
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Government-issued identification (for KYC verification)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Payment and wallet information
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Profile information and preferences
                    </ListItem>
                  </List>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="green.800" mb={2}>Usage Information:</Text>
                  <List spacing={2} ml={4}>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Device information and IP address
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Browser type and operating system
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Pages visited and time spent on the Platform
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Transaction history and investment data
                    </ListItem>
                  </List>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="green.800" mb={2}>Blockchain Data:</Text>
                  <List spacing={2} ml={4}>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Wallet addresses and transaction records
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      Smart contract interactions
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FiCheckCircle} color="green.500" />
                      On-chain activity related to Platform use
                    </ListItem>
                  </List>
                </Box>
              </VStack>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                2. How We Use Your Information
              </Heading>
              <Text color="gray.700" mb={3}>We use collected information to:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Provide and maintain Platform services
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Process transactions and investments
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Verify your identity and prevent fraud
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Send transactional and promotional communications
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Improve Platform functionality and user experience
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Comply with legal and regulatory requirements
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Analyze Platform usage and trends
                </ListItem>
              </List>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                3. Information Sharing
              </Heading>
              <Text color="gray.700" mb={3}>We may share your information with:</Text>
              <List spacing={3} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Service Providers:</Text> Third-party vendors who assist in Platform operations
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Agricultural Partners:</Text> Farmers and cooperatives you invest in (limited information)
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Payment Processors:</Text> To facilitate financial transactions
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Legal Authorities:</Text> When required by law or to protect our rights
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  <Text as="span" fontWeight="bold">Business Transfers:</Text> In connection with mergers or acquisitions
                </ListItem>
              </List>
              <Text color="gray.700" mt={4} fontStyle="italic">
                We do not sell your personal information to third parties for marketing purposes.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                4. Data Security
              </Heading>
              <Text color="gray.700" mb={3}>We implement security measures including:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Encryption of data in transit and at rest
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Regular security audits and penetration testing
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Multi-factor authentication options
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Restricted access to personal information
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Secure data centers and infrastructure
                </ListItem>
              </List>
              <Text color="gray.600" mt={4} fontSize="sm" fontStyle="italic">
                However, no method of transmission over the internet is 100% secure, and we cannot
                guarantee absolute security.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                5. Cookies and Tracking
              </Heading>
              <Text color="gray.700" mb={3}>
                We use cookies and similar technologies to enhance your experience, analyze usage,
                and deliver personalized content. You can control cookie preferences through your
                browser settings.
              </Text>
              <Text fontWeight="bold" color="green.800" mb={2}>Types of cookies we use:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Essential cookies for Platform functionality
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Analytics cookies to understand usage patterns
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Preference cookies to remember your settings
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Marketing cookies for targeted advertising
                </ListItem>
              </List>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                6. Your Rights
              </Heading>
              <Text color="gray.700" mb={3}>You have the right to:</Text>
              <List spacing={2} ml={4}>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Access your personal information
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Request correction of inaccurate data
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Request deletion of your data (subject to legal obligations)
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Object to processing of your information
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Request data portability
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Withdraw consent for data processing
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheckCircle} color="green.500" />
                  Opt-out of marketing communications
                </ListItem>
              </List>
              <Text color="gray.700" mt={4}>
                To exercise these rights, contact us at privacy@rootrise.com
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                7. Data Retention
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                We retain your information for as long as necessary to provide services and comply
                with legal obligations. Blockchain data, by its nature, is permanent and cannot be
                deleted from the blockchain.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                8. International Data Transfers
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                Your information may be transferred to and processed in countries other than your
                own. We ensure appropriate safeguards are in place to protect your data in
                accordance with this Privacy Policy.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                9. Children&apos;s Privacy
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                The Platform is not intended for users under 18 years of age. We do not knowingly
                collect information from children. If you believe we have collected information
                from a child, please contact us immediately.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                10. Changes to Privacy Policy
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                We may update this Privacy Policy periodically. We will notify you of significant
                changes by posting a notice on the Platform or sending an email. Your continued use
                after changes constitutes acceptance of the updated policy.
              </Text>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="lg" borderLeft="4px" borderColor="green.600">
              <Heading size="md" color="green.900" mb={3}>
                11. Contact Us
              </Heading>
              <Text color="gray.700" mb={4}>
                For questions or concerns about this Privacy Policy, please contact us:
              </Text>
              <VStack align="start" spacing={2}>
                <Text>
                  <Text as="span" fontWeight="bold" color="green.800">Email:</Text> j.alana@alustudent.com
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold" color="green.800">Address:</Text> Kigali, Rwanda
                </Text>
                <Text>
                  <Text as="span" fontWeight="bold" color="green.800">Phone:</Text> +250792402699
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Footer */}
        <Box
          bgGradient="linear(to-r, green.700, emerald.800)"
          color="white"
          borderRadius="2xl"
          boxShadow="xl"
          p={8}
          textAlign="center"
        >
          <VStack spacing={3}>
            <Text fontSize="lg" fontWeight="semibold">
              © 2025 RootRise. All rights reserved.
            </Text>
            <Text color="green.200">
              Blockchain-Based Agricultural Crowdfunding Platform
            </Text>
            <Badge colorScheme="whiteAlpha" fontSize="sm">
              Last Updated: 20th of November 2025
            </Badge>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}