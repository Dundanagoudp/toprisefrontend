import Image from "next/image"
import Footer from "./Footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div
        className="relative bg-gray-800 text-white py-8 px-6 bg-cover bg-center min-h-[250px] flex  items-center"
      >
      
        {/* Background image for header */}
        <Image src="/assets/HeroBg.jpg" alt="Background" fill className="object-cover" priority />
        <div className="relative container mx-auto px-4">
          <h1 className="text-3xl font-bold">Privacy and Policy</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-9">
          {/* First Section */}
        <div className="container mx-auto px-4 py-16">
  <div className="space-y-9">
    {/* Information We Collect */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">1. Information We Collect</h2>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>We collect the following types of information when you register, browse, or place an order:</li>
        <li>
          <strong>1.1 Personally Identifiable Information (PII):</strong>
          <ul className="list-disc ml-6">
            <li>Full name</li>
            <li>Mobile number</li>
            <li>Email address</li>
            <li>Billing and shipping address</li>
            <li>GSTIN (if applicable)</li>
            <li>PAN (for vendors/distributors)</li>
            <li>Bank details (for refunds, dealers, or payouts)</li>
          </ul>
        </li>
        <li>
          <strong>1.2 Transactional Information:</strong>
          <ul className="list-disc ml-6">
            <li>Product orders</li>
            <li>Payment method (we don’t store card details; payments are processed securely via third-party gateways)</li>
            <li>Delivery history</li>
            <li>Return and refund records</li>
          </ul>
        </li>
        <li>
          <strong>1.3 Device & App Data:</strong>
          <ul className="list-disc ml-6">
            <li>IP address</li>
            <li>Device ID, model, and OS version</li>
            <li>App crash logs and performance metrics</li>
            <li>Cookies and web beacons</li>
            <li>Time zone, browser type, and access times</li>
          </ul>
        </li>
        <li>
          <strong>1.4 Location Information:</strong>
          <ul className="list-disc ml-6">
            <li>We may collect GPS or IP-based location for delivery optimization or fraud detection (only with permission on the app).</li>
          </ul>
        </li>
      </ul>
    </section>

    {/* How We Use Your Information */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">2. How We Use Your Information</h2>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>Order fulfilment: Processing and shipping your orders, providing order updates and invoices</li>
        <li>Customer support: Resolving complaints, queries, or service requests</li>
        <li>Account management: Facilitating login, OTP verification, and order history</li>
        <li>Marketing communication: Sending offers, promotions, new arrivals (only with your consent)</li>
        <li>Improving services: Personalizing product recommendations, improving UI/UX based on user behaviour</li>
        <li>Compliance: Tax invoicing, legal disputes, KYC for dealers, or regulatory compliance</li>
      </ul>
    </section>

    {/* Data Sharing and Disclosure */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">3. Data Sharing and Disclosure</h2>
      <p className="mb-2">We do not sell your personal data. However, we may share data under the following conditions:</p>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>
          <strong>3.1 With Service Providers:</strong>
          <ul className="list-disc ml-6">
            <li>Courier/logistics partners (for shipping)</li>
            <li>Payment gateways (Razorpay, Paytm, etc.)</li>
            <li>SMS/email/WhatsApp notification vendors</li>
            <li>IT and analytics service providers</li>
            <li>All vendors are bound by NDAs and data protection obligations.</li>
          </ul>
        </li>
        <li>
          <strong>3.2 With Vendors/Dealers:</strong>
          <ul className="list-disc ml-6">
            <li>Your contact and order details may be shared with verified dealers if they are the product seller.</li>
            <li>Dealers may contact you only for order clarification or delivery coordination.</li>
          </ul>
        </li>
        <li>
          <strong>3.3 With Authorities:</strong>
          <ul className="list-disc ml-6">
            <li>If required by law, court order, or regulatory investigation, we may disclose your data to government authorities.</li>
          </ul>
        </li>
      </ul>
    </section>

    {/* Cookies and Tracking Technologies */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">4. Cookies and Tracking Technologies</h2>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>Keep you logged in</li>
        <li>Remember your cart and preferences</li>
        <li>Analyse traffic and usage patterns</li>
      </ul>
      <p>You may disable cookies in your browser, but this may limit certain features.</p>
    </section>

    {/* Data Security */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">5. Data Security</h2>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>Encrypted data transmission using HTTPS</li>
        <li>OTP verification for critical actions</li>
        <li>Access control for employee data handling</li>
        <li>Regular audits and vulnerability checks</li>
      </ul>
      <p>However, no digital system is 100% secure. You use the Platform at your own risk.</p>
    </section>

    {/* Data Retention */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">6. Data Retention</h2>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>We retain your personal data as long as your account is active or as needed to provide services.</li>
        <li>Data related to orders and taxes may be retained for up to 8 years as per Indian laws.</li>
        <li>You may request deletion of your data by writing to us (unless restricted by compliance requirements).</li>
      </ul>
    </section>

    {/* User Rights */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">7. User Rights</h2>
      <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
        <li>Access: View what data we hold about you</li>
        <li>Correction: Update or correct inaccuracies in your profile</li>
        <li>Deletion: Request account closure and data erasure</li>
        <li>Withdraw consent: Opt out of promotional messages anytime</li>
        <li>Restrict processing: Temporarily halt use of your data in case of a dispute</li>
      </ul>
      <p>Write to us at <span className="font-semibold">[insert email]</span> to exercise any of the above rights.</p>
    </section>

    {/* Children’s Privacy */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">8. Children’s Privacy</h2>
      <p>
        Our Platform is not intended for users under 18 years of age. We do not knowingly collect personal data from minors. If we find that we have done so inadvertently, we will delete such information promptly.
      </p>
    </section>

    {/* Third-Party Links */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">9. Third-Party Links</h2>
      <p>
        Our Platform may contain links to external websites or payment gateways. We are not responsible for the privacy practices or content of these third-party platforms.
      </p>
    </section>

    {/* Updates to this Policy */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">10. Updates to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Effective Date” at the top indicates when it was last revised. Continued use of the Platform implies consent to the updated terms.
      </p>
    </section>

    {/* Grievance Officer & Contact */}
    <section>
      <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">11. Grievance Officer & Contact</h2>
      <p>
        For any complaints, disputes, or data-related requests, please contact:
      </p>
      <ul className="list-none ml-0 mb-4">
        <li><strong>Grievance Officer:</strong> Ayush Bhartia</li>
        <li><strong>Email:</strong> ayush@toprise.in</li>
        <li><strong>Phone:</strong> +91 9122221804</li>
        <li><strong>Address:</strong> A-924, Tower 3, NX One, Gaur Chowk, Plot No. 17, Tech Zone IV, Amrapali Dream Valley, Greater Noida, Uttar Pradesh 201301</li>
        <li><strong>Hours:</strong> Mon–Fri, 10 AM to 6 PM IST</li>
      </ul>
      <p>We are committed to resolving complaints within 15 working days.</p>
    </section>
  </div>
</div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
