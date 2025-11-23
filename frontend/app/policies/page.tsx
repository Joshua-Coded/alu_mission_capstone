export default function PoliciesPage() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold mb-2">RootRise Legal & Privacy</h1>
            <p className="text-green-100 text-lg">
              End User License Agreement, Copyright & Privacy Policy
            </p>
          </div>
        </header>
  
        {/* Navigation */}
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-green-500">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex flex-wrap gap-6 justify-center">
              <a
                href="#eula"
                className="text-green-700 hover:text-green-900 font-semibold transition-colors duration-200 hover:underline"
              >
                End User License Agreement
              </a>
              <a
                href="#copyright"
                className="text-green-700 hover:text-green-900 font-semibold transition-colors duration-200 hover:underline"
              >
                Copyright Notice
              </a>
              <a
                href="#privacy"
                className="text-green-700 hover:text-green-900 font-semibold transition-colors duration-200 hover:underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </nav>
  
        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* EULA Section */}
          <section id="eula" className="mb-16 bg-white rounded-2xl shadow-xl p-8 border-t-4 border-green-500">
            <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-green-600 mr-3 rounded"></span>
              End User License Agreement (EULA)
            </h2>
            <p className="text-gray-600 mb-8 text-sm">
              <strong>Effective Date:</strong> 20th of November 2025
            </p>
  
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                This End User License Agreement (&quot;Agreement&quot;) is a legal agreement between you
                (&quot;User&quot;) and <strong className="text-green-700">RootRise</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) for
                the use of the RootRise blockchain-based agricultural crowdfunding platform
                (&quot;Platform&quot;). By accessing or using the Platform, you agree to be bound by the
                terms of this Agreement.
              </p>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">1. Grant of License</h3>
                <p>
                  Subject to your compliance with this Agreement, we grant you a limited,
                  non-exclusive, non-transferable, revocable license to access and use the
                  Platform for your personal or business purposes in accordance with these terms.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">2. User Obligations</h3>
                <p className="mb-3">You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Use the Platform only for lawful purposes</li>
                  <li>Not engage in fraudulent, abusive, or harmful activities</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">3. Restrictions</h3>
                <p className="mb-3">You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Copy, modify, or distribute the Platform&apos;s content or software</li>
                  <li>Reverse engineer, decompile, or disassemble the Platform</li>
                  <li>Use the Platform to transmit malware or harmful code</li>
                  <li>Interfere with or disrupt the Platform&apos;s operation</li>
                  <li>Attempt to gain unauthorized access to any part of the Platform</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">4. Intellectual Property</h3>
                <p>
                  All content, trademarks, logos, and intellectual property on the Platform are
                  owned by RootRise or its licensors. You are granted no rights to use such
                  materials except as expressly permitted in this Agreement.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">5. Blockchain Transactions</h3>
                <p>
                  The Platform utilizes blockchain technology for transactions. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>Blockchain transactions are irreversible</li>
                  <li>You are responsible for the accuracy of transaction details</li>
                  <li>Network fees may apply and are subject to change</li>
                  <li>We are not responsible for blockchain network delays or failures</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">6. Investment Risk Disclosure</h3>
                <p>
                  Agricultural investments carry inherent risks. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>Investments may result in partial or total loss</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>We do not provide financial, legal, or investment advice</li>
                  <li>You should conduct your own due diligence before investing</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">7. Disclaimers</h3>
                <p>
                  THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                  IMPLIED. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE OPERATION OF THE
                  PLATFORM.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">8. Limitation of Liability</h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF
                  THE PLATFORM.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">9. Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your access to the Platform at any
                  time for violation of this Agreement or for any other reason at our discretion.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">10. Governing Law</h3>
                <p>
                  This Agreement shall be governed by and construed in accordance with the laws of
                  Rwanda, without regard to its conflict of law provisions.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">11. Changes to Agreement</h3>
                <p>
                  We reserve the right to modify this Agreement at any time. Changes will be
                  effective upon posting to the Platform. Your continued use constitutes acceptance
                  of the modified terms.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-800 mb-3 text-xl">12. Contact Information</h3>
                <p>
                  For questions about this Agreement, please contact us at:
                  <br />
                  <strong className="text-green-700">Email:</strong> j.alana@alustudent.com
                  <br />
                  <strong className="text-green-700">Address:</strong> Kigali, Rwanda.
                </p>
              </div>
            </div>
          </section>
  
          {/* Copyright Section */}
          <section id="copyright" className="mb-16 bg-white rounded-2xl shadow-xl p-8 border-t-4 border-emerald-500">
            <h2 className="text-3xl font-bold text-emerald-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-emerald-600 mr-3 rounded"></span>
              Copyright Notice
            </h2>
            <p className="text-gray-600 mb-8 text-sm">
              <strong>Effective Date:</strong> 20th of November 2025
            </p>
  
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">1. Ownership</h3>
                <p>
                  All content on the RootRise Platform, including but not limited to text, graphics,
                  logos, images, videos, software, and data compilations, is the property of
                  RootRise or its content suppliers and is protected by international copyright laws.
                </p>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">2. Copyright Protection</h3>
                <p>
                  © 2025 RootRise. All rights reserved. The RootRise name, logo, and all related
                  names, logos, product and service names, designs, and slogans are trademarks of
                  RootRise or its affiliates.
                </p>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">3. Permitted Use</h3>
                <p className="mb-3">You may:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>View and use the Platform for personal or business purposes</li>
                  <li>Print or download content for personal reference</li>
                  <li>Share links to the Platform on social media</li>
                </ul>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">4. Prohibited Use</h3>
                <p className="mb-3">You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Copy, reproduce, or distribute Platform content without permission</li>
                  <li>Modify, adapt, or create derivative works</li>
                  <li>Use content for commercial purposes without authorization</li>
                  <li>Remove or alter copyright notices or watermarks</li>
                  <li>Use automated systems to scrape or collect Platform data</li>
                </ul>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">5. User-Generated Content</h3>
                <p>
                  By submitting content to the Platform, you grant RootRise a worldwide,
                  non-exclusive, royalty-free license to use, reproduce, modify, and display such
                  content in connection with the Platform&apos;s operation.
                </p>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">
                  6. Digital Millennium Copyright Act (DMCA)
                </h3>
                <p>
                  If you believe that your copyrighted work has been infringed, please provide our
                  designated agent with:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>Identification of the copyrighted work</li>
                  <li>Identification of the infringing material</li>
                  <li>Your contact information</li>
                  <li>A statement of good faith belief</li>
                  <li>A statement of accuracy under penalty of perjury</li>
                  <li>Physical or electronic signature</li>
                </ul>
                <p className="mt-3">
                  <strong className="text-emerald-700">DMCA Agent:</strong>
                  <br />
                  Email: j.alana@alustudent.com
                  <br />
                  Address: Kigali, Rwanda.
                </p>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">7. Third-Party Content</h3>
                <p>
                  The Platform may contain content provided by third parties. RootRise respects the
                  intellectual property rights of others and expects users to do the same.
                </p>
              </div>
  
              <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-emerald-800 mb-3 text-xl">8. Enforcement</h3>
                <p>
                  RootRise actively monitors for copyright violations and will take appropriate
                  action, including account termination and legal proceedings, against users who
                  infringe copyrights.
                </p>
              </div>
            </div>
          </section>
  
          {/* Privacy Policy Section */}
          <section id="privacy" className="mb-16 bg-white rounded-2xl shadow-xl p-8 border-t-4 border-green-600">
            <h2 className="text-3xl font-bold text-green-900 mb-6 flex items-center">
              <span className="w-2 h-8 bg-green-700 mr-3 rounded"></span>
              Privacy Policy
            </h2>
            <p className="text-gray-600 mb-8 text-sm">
              <strong>Effective Date:</strong> 20th of November 2025
            </p>
  
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                RootRise (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our Platform.
              </p>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">1. Information We Collect</h3>
                <p className="mb-3">
                  <strong className="text-green-800">Personal Information:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name, email address, phone number</li>
                  <li>Government-issued identification (for KYC verification)</li>
                  <li>Payment and wallet information</li>
                  <li>Profile information and preferences</li>
                </ul>
                <p className="mb-3 mt-4">
                  <strong className="text-green-800">Usage Information:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and time spent on the Platform</li>
                  <li>Transaction history and investment data</li>
                </ul>
                <p className="mb-3 mt-4">
                  <strong className="text-green-800">Blockchain Data:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Wallet addresses and transaction records</li>
                  <li>Smart contract interactions</li>
                  <li>On-chain activity related to Platform use</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">2. How We Use Your Information</h3>
                <p className="mb-3">We use collected information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain Platform services</li>
                  <li>Process transactions and investments</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Send transactional and promotional communications</li>
                  <li>Improve Platform functionality and user experience</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Analyze Platform usage and trends</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">3. Information Sharing</h3>
                <p className="mb-3">We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who assist in Platform
                    operations
                  </li>
                  <li>
                    <strong>Agricultural Partners:</strong> Farmers and cooperatives you invest in
                    (limited information)
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> To facilitate financial transactions
                  </li>
                  <li>
                    <strong>Legal Authorities:</strong> When required by law or to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with mergers or acquisitions
                  </li>
                </ul>
                <p className="mt-3">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">4. Data Security</h3>
                <p className="mb-3">We implement security measures including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Multi-factor authentication options</li>
                  <li>Restricted access to personal information</li>
                  <li>Secure data centers and infrastructure</li>
                </ul>
                <p className="mt-3">
                  However, no method of transmission over the internet is 100% secure, and we cannot
                  guarantee absolute security.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">5. Cookies and Tracking</h3>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage,
                  and deliver personalized content. You can control cookie preferences through your
                  browser settings.
                </p>
                <p className="mt-3">
                  <strong className="text-green-800">Types of cookies we use:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Essential cookies for Platform functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>Marketing cookies for targeted advertising</li>
                </ul>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">6. Your Rights</h3>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (subject to legal obligations)</li>
                  <li>Object to processing of your information</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, contact us at privacy@rootrise.com
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">7. Data Retention</h3>
                <p>
                  We retain your information for as long as necessary to provide services and comply
                  with legal obligations. Blockchain data, by its nature, is permanent and cannot be
                  deleted from the blockchain.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">8. International Data Transfers</h3>
                <p>
                  Your information may be transferred to and processed in countries other than your
                  own. We ensure appropriate safeguards are in place to protect your data in
                  accordance with this Privacy Policy.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">9. Children&apos;s Privacy</h3>
                <p>
                  The Platform is not intended for users under 18 years of age. We do not knowingly
                  collect information from children. If you believe we have collected information
                  from a child, please contact us immediately.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">10. Changes to Privacy Policy</h3>
                <p>
                  We may update this Privacy Policy periodically. We will notify you of significant
                  changes by posting a notice on the Platform or sending an email. Your continued use
                  after changes constitutes acceptance of the updated policy.
                </p>
              </div>
  
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="font-bold text-green-900 mb-3 text-xl">11. Contact Us</h3>
                <p>
                  For questions or concerns about this Privacy Policy, please contact us:
                </p>
                <div className="mt-3 space-y-1">
                  <p>
                    <strong className="text-green-800">Email:</strong> j.alana@alustudent.com
                  </p>
                  <p>
                    <strong className="text-green-800">Address:</strong> Kigali, Rwanda.
                  </p>
                  <p>
                    <strong className="text-green-800">Phone:</strong> +250792402699
                  </p>
                </div>
              </div>
            </div>
          </section>
  
          {/* Footer */}
          <footer className="bg-gradient-to-r from-green-700 to-emerald-800 text-white rounded-2xl shadow-xl p-8 mt-12">
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold">© 2025 RootRise. All rights reserved.</p>
              <p className="text-green-200">
                Blockchain-Based Agricultural Crowdfunding Platform
              </p>
              <p className="text-sm text-green-300">Last Updated: 20th of November 2025</p>
            </div>
          </footer>
        </main>
      </div>
    );
  }