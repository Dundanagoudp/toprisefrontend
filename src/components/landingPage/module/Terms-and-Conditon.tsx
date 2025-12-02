import Image from "next/image";
import Footer from "./Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative bg-gray-800 text-white py-8 px-6 bg-cover bg-center min-h-[250px] flex  items-center">
        {/* Background image for header */}
        <Image
          src="/assets/HeroBg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">Terms and Conditions</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-9">
          {/* First Section */}
          <section>
            <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
              1. Definitions
            </h2>
            <ul className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 list-disc pl-6 text-justify">
              <li>
                <strong>User/You/Customer:</strong> Any person who accesses,
                registers, browses, or transacts on the Toprise Platform.
              </li>
              <li>
                <strong>Vendor/Dealer:</strong> Authorized third-party business
                partners listed on the platform offering products for sale.
              </li>
              <li>
                <strong>Product:</strong> Any item listed on the Toprise
                platform available for purchase.
              </li>
              <li>
                <strong>Order:</strong> A confirmed purchase request made by the
                user through the platform.
              </li>
              <li>
                <strong>Account:</strong> The digital profile created by the
                user to interact with the services of Toprise.
              </li>
            </ul>
          </section>

          {/* Second Section */}
          <section>
            <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
              2.Eligibility to Use
            </h2>
           
              <ul className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 list-disc pl-6 text-justify">
                <li>
                  You must be at least 18
                  years old or the age of majority in your jurisdiction to
                  create an account and use our services.{" "}
                </li>
                <li>
                  {" "}
                  You must be an authorized representative of the business you
                  are registering on behalf of and have the authority to bind
                  that business to these terms.
                </li>
                <li>
                  {" "}
                  Any item listed on the Toprise platform available for
                  purchase.
                </li>
                <li>
                  {" "}
                  Users under the age of 18 must use the platform under the
                  supervision of a parent or legal guardian.{" "}
                </li>
                <li>
                  {" "}
                  We reserve the right to refuse access or service to any user
                  without providing a reason.{" "}
                </li>
              </ul>
           
            <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
             3. User Account & Verification 
            </h2>
        
              <ul className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 list-disc pl-6 text-justify">
            
                <li>
                  {" "}
                      To place orders, users must create an account by providing accurate details including mobile number, email, and delivery address. 
                </li>
                <li>
                  {" "}
                     One-time password (OTP) verification may be required for registration, login, and checkout. 
                </li>
                <li>
                  {" "}
                     Users are responsible for maintaining the confidentiality of their account information and agree to accept responsibility for all activities under their account. 
                </li>
                <li>
                  {" "}
                     You agree to update your information promptly to ensure accuracy. 
                </li>
              </ul>
          </section>

          {/* Second Section */}
          <section>
            <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
              4. Product Listings and Descriptions 
            </h2>
             <ul className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 list-disc pl-6 text-justify">
            
                <li>
                  {" "}
                          All product listings are either uploaded by authorized vendors or by Toprise administrators. 
                </li>
                <li>
                  {" "}
                        We make every effort to ensure that product descriptions, images, compatibility, specifications, warranty, and pricing are accurate. 
                </li>
                <li>
                  {" "}
                         However, errors may occur. If we discover an error in the listing after you have placed an order, we reserve the right to cancel or amend the order. 
                </li>
           
              </ul>
          </section>
     <section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    5. Order Acceptance & Processing
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <p className="text-[#61656A] text-xl font-sans leading-relaxed">
      Placing an order does not guarantee acceptance. An order is confirmed only after:
    </p>
    <ul className="list-disc pl-6 my-2 text-justify ">
      <li>Payment is successfully received (for prepaid orders), or</li>
      <li>Cash on Delivery (COD) is validated (if offered).</li>
    </ul>
    <p className="text-[#61656A] text-lg font-sans leading-relaxed">
      We reserve the right to reject or cancel any order at any time due to:
    </p>
    <ul className="list-disc pl-6 my-2">
      <li>Product unavailability</li>
      <li>Suspected fraud or misuse</li>
      <li>Incorrect pricing or technical errors</li>
      <li>Violation of these Terms</li>
    </ul>
    <p className="text-[#61656A] text-lg font-sans leading-relaxed">
      You will be notified promptly in such cases, and any payments received will be refunded as per the refund policy.
    </p>
  </div>
</section>
<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    6. Pricing, Taxes & Invoicing
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2">
      <li>
        All prices are listed in INR (Indian Rupees) and include GST and other applicable taxes unless stated otherwise.
      </li>
      <li>
        Prices may change without prior notice. However, the price displayed at the time of order confirmation will be applicable.
      </li>
      <li>
        A tax invoice will be issued for each order either by Toprise or the selling dealer.
      </li>
      <li>
        Discounts, promo codes, and special offers may be subject to specific terms and conditions.
      </li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    7. Shipping, Delivery & Logistics
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2">
      <li>We partner with third-party logistics providers (3PLs) for product delivery.</li>
      <li>Estimated delivery timelines are shown on the product page but may vary based on availability, location, and logistics.</li>
      <li>Tracking information is shared via your registered contact details (SMS, Email, WhatsApp).</li>
      <li>Delays due to natural calamities, strikes, or courier disruptions are not under our control.</li>
      <li>Risk of loss or damage passes to the user once the product is handed over to the delivery service.</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    8. Cancellations, Returns, and Refunds
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <h3 className="text-2xl md:text-3xl font-semibold text-[#131920] mt-2 mb-1">8.1 Cancellation Policy:</h3>
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>You may cancel an order until it is dispatched. Post-dispatch, cancellation is not guaranteed.</li>
      <li>Certain products (e.g., made-to-order or electrical parts) may not be cancellable. This will be mentioned in the product detail page or quotation.</li>
    </ul>
    <h3 className="text-2xl md:text-3xl font-semibold text-[#131920] mt-2 mb-1">8.2 Return Policy:</h3>
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Eligible products can be returned within 7 days of delivery if:</li>
      <ul className="list-disc pl-8 my-2 text-justify">
        <li>Wrong item received</li>
        <li>Item is damaged, defective, or not functioning</li>
        <li>Item differs significantly from the listing</li>
      </ul>
      <li>Return requests must be placed through your Toprise account, WhatsApp, email, or phone, with clear images and reason.</li>
      <li>Returned items must be in unused condition with original packaging, labels, and invoices.</li>
    </ul>
    <h3 className="text-2xl md:text-3xl font-semibold text-[#131920] mt-2 mb-1">8.3 Refund Policy:</h3>
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Upon return approval and item inspection, refunds will be issued to the original payment method within 7–10 business days.</li>
      <li>For COD orders, bank details will be collected for NEFT refund.</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    9. Product Warranties & Claims
  </h2>
  <div className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 pl-1 text-justify ">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Warranty details (if any) will be clearly listed in the product description or invoice.</li>
      <li>Toprise does not assume responsibility for manufacturer warranty obligations unless stated.</li>
      <li>For claim processing:</li>
      <ul className="list-disc pl-8 my-2 text-justify">
        <li>Original invoice and packaging must be retained.</li>
        <li>Claims are subject to inspection and verification by manufacturer or dealer.</li>
      </ul>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    10. Intellectual Property Rights
  </h2>
  <div className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>All content on the platform including text, logos, images, design, software, and trademarks is the intellectual property of Toprise Ventures or its licensors.</li>
      <li>No user may copy, reproduce, republish, transmit, or exploit any part of the platform without prior written permission.</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    11. User Obligations & Acceptable Use
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <p className="text-[#61656A] text-xl font-sans leading-relaxed">By using the Platform, you agree that you will NOT:</p>
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Post or share any false, misleading, defamatory, or abusive content.</li>
      <li>Use the platform for fraudulent activities, including fake orders or payment reversal abuse.</li>
      <li>Interfere with the platform’s technical operations, security, or software.</li>
      <li>Collect or misuse data from other users or the platform.</li>
    </ul>
    <p className="text-[#61656A] text-lg font-sans leading-relaxed">Violation may result in account suspension, legal action, or order rejection.</p>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    12. Third-Party Vendors & Dealer Listings
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Products may be listed directly by dealers. In such cases, Toprise acts only as an aggregator or facilitator.</li>
      <li>Toprise is not liable for disputes arising from:</li>
      <ul className="list-disc pl-8 my-2 text-justify ">
        <li>Incorrect dealer claims</li>
        <li>Warranty refusals by external parties</li>
        <li>Delivery issues handled directly by the dealer</li>
      </ul>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    13. Limitation of Liability
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Toprise shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from:</li>
      <ul className="list-disc pl-8 my-2 text-justify">
        <li>Use or inability to use the platform</li>
        <li>Delay in delivery</li>
        <li>Product issues not arising from our negligence</li>
      </ul>
      <li>Maximum liability of Toprise shall not exceed the value of the disputed order or INR 5,000, whichever is lower.</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    14. Indemnification
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <p className="text-[#61656A] text-xl font-sans leading-relaxed">
      You agree to indemnify and hold harmless Toprise Ventures, its affiliates, directors, employees, and partners from any losses, liabilities, claims, damages, or expenses arising out of:
    </p>
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Your breach of these Terms</li>
      <li>Violation of laws or third-party rights</li>
      <li>Misuse of the platform or fraudulent behaviour</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    15. Platform Availability & Modifications
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2">
      <li>We strive to keep the platform operational 24x7 but cannot guarantee uninterrupted or error-free access.</li>
      <li>We reserve the right to modify, suspend, or terminate any part of the service (temporarily or permanently) without prior notice.</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">
    16. Governing Law & Jurisdiction
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>These Terms shall be governed by and interpreted in accordance with the laws of India.</li>
      <li>Any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    17. Termination & Account Suspension
  </h2>
  <div className="text-[#61656A] text-xl font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>We reserve the right to suspend or permanently block any user account without notice if:</li>
      <ul className="list-disc pl-8 my-2 text-justify ">
        <li>Fraud or abuse is detected</li>
        <li>Multiple order violations occur</li>
        <li>Terms & Conditions are breached</li>
      </ul>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    18. Force Majeure
  </h2>
  <div className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 pl-1 text-justify">
    <p className="text-[#61656A] text-lg font-sans leading-relaxed">
      Toprise is not liable for any failure to perform due to unforeseen circumstances such as:
    </p>
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Acts of God</li>
      <li>Government restrictions</li>
      <li>Cyberattacks</li>
      <li>Courier strikes or lockdowns</li>
    </ul>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    19. Feedback & Complaints
  </h2>
  <div className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 pl-1 text-justify">
    <p className="text-[#61656A] text-lg font-sans leading-relaxed">
      You may submit feedback or complaints to:<br />
      Email: info@Toprise.in<br />
      Phone: +91 9122221804<br />
      Registered Office: A-924, Tower 3, NX One, Gaur Chowk, Plot No. 17, Tech Zone IV, Amrapali Dream Valley, Greater Noida, Uttar Pradesh 201301
    </p>
    <p className="text-[#61656A] text-lg font-sans leading-relaxed">
      We aim to resolve all issues within 7 business days wherever possible.
    </p>
  </div>
</section>

<section>
  <h2 className="text-3xl font-semibold font-sans text-[#131920] mb-4">
    20. Changes to Terms
  </h2>
  <div className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 pl-1 text-justify">
    <ul className="list-disc pl-6 my-2 text-justify">
      <li>Toprise reserves the right to revise these Terms at any time. Updates will be posted on the website/app.</li>
      <li>Continued use of the platform after such updates constitutes acceptance of the revised Terms.</li>
    </ul>
  </div>
</section>

        </div>
      
      </div>
      <Footer />
    </div>
  );
}
